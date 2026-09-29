/**
 * Google Sheets Service
 * Semua operasi baca/tulis ke Google Sheets dilakukan di sini.
 * File ini HANYA dijalankan di server (API routes) — tidak pernah di client.
 */

import { google, sheets_v4 } from 'googleapis';

// ── Auth ─────────────────────────────────────────────────────────────────────

function getAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!email || !key) {
        throw new Error('Google service account credentials tidak ditemukan di environment variables');
    }

    return new google.auth.GoogleAuth({
        credentials: {
            client_email: email,
            private_key: key,
        },
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    });
}

function getSheetsClient(): sheets_v4.Sheets {
    const auth = getAuth();
    return google.sheets({ version: 'v4', auth });
}

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

// ── Sheet Names ───────────────────────────────────────────────────────────────

export const SHEETS = {
    PROFILE: 'Profile',
    SKILLS: 'Skills',
    SERVICES: 'Services',
    PROJECTS: 'Projects',
    PROJECT_IMAGES: 'Project_Images',
    MESSAGES: 'Messages',
} as const;

// ── Generic Helpers ───────────────────────────────────────────────────────────

/**
 * Ambil semua baris dari sebuah sheet.
 * Baris pertama dianggap sebagai header.
 * Return: array of objects { header: value }
 */
export async function getSheetRows(sheetName: string): Promise<unknown[]> {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName,
    });

    const rows = response.data.values ?? [];
    if (rows.length < 2) return [];

    const headers = rows[0].map((h: string) => String(h).trim());
    return rows.slice(1).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, i) => {
            obj[header] = String((row as string[])[i] ?? '').trim();
        });
        return obj;
    });
}

/**
 * Append satu baris baru ke sheet.
 * values: array sesuai urutan kolom header.
 */
export async function appendSheetRow(sheetName: string, values: string[]): Promise<void> {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
            values: [values],
        },
    });
}

/**
 * Update satu baris berdasarkan nomor baris (1-indexed, baris 1 = header).
 * rowIndex: index dalam array getSheetRows (0-based) → row di sheet = rowIndex + 2
 */
export async function updateSheetRow(
    sheetName: string,
    rowIndex: number,
    values: string[]
): Promise<void> {
    const sheets = getSheetsClient();
    const sheetRow = rowIndex + 2; // +1 untuk header, +1 untuk 1-based index
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A${sheetRow}`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [values],
        },
    });
}

/**
 * Hapus satu baris berdasarkan nomor baris di sheet (1-based, baris 1 = header).
 * Menggunakan batchUpdate untuk delete row (bukan clear).
 */
export async function deleteSheetRow(sheetName: string, rowIndex: number): Promise<void> {
    const sheets = getSheetsClient();
    const sheetRow = rowIndex + 1; // row di sheet (0-based untuk batchUpdate): +1 header, tapi API 0-based

    // Ambil sheetId dari nama sheet
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = meta.data.sheets?.find((s) => s.properties?.title === sheetName);
    if (!sheet?.properties?.sheetId) {
        throw new Error(`Sheet "${sheetName}" tidak ditemukan`);
    }
    const sheetId = sheet.properties.sheetId;

    // Delete baris (0-based: header = 0, data mulai dari 1)
    const startIndex = sheetRow; // baris data ke-rowIndex ada di sheet row rowIndex+1 (0-based)
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
                            startIndex,
                            endIndex: startIndex + 1,
                        },
                    },
                },
            ],
        },
    });
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Record<string, string>> {
    const rows = (await getSheetRows(SHEETS.PROFILE)) as unknown as Array<{ key: string; value: string }>;
    const profile: Record<string, string> = {};
    for (const row of rows) {
        if (row.key) {
            profile[row.key] = row.value ?? '';
        }
    }
    return profile;
}

export async function updateProfileKey(key: string, value: string): Promise<void> {
    const sheets = getSheetsClient();
    const rows = (await getSheetRows(SHEETS.PROFILE)) as unknown as Array<{ key: string; value: string }>;
    const idx = rows.findIndex((r) => r.key === key);

    if (idx === -1) {
        // Key belum ada, append
        await appendSheetRow(SHEETS.PROFILE, [key, value]);
    } else {
        // Update baris yang ada
        await updateSheetRow(SHEETS.PROFILE, idx, [key, value]);
    }
}

export async function updateProfileBulk(data: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
        await updateProfileKey(key, value);
    }
}

// ── Skills ────────────────────────────────────────────────────────────────────

export interface Skill {
    id: string;
    name: string;
    category: string;
    level: string;
    icon: string;
    sort_order: string;
    published: string;
}

export async function getSkills(): Promise<Skill[]> {
    return (await getSheetRows(SHEETS.SKILLS)) as unknown as Skill[];
}

export async function createSkill(data: Omit<Skill, 'id'>): Promise<Skill> {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    const values = [
        id,
        data.name,
        data.category,
        data.level,
        data.icon,
        data.sort_order,
        data.published,
    ];
    await appendSheetRow(SHEETS.SKILLS, values);
    return { id, ...data };
}

export async function updateSkill(id: string, data: Partial<Omit<Skill, 'id'>>): Promise<void> {
    const rows = await getSkills();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Skill ${id} tidak ditemukan`);
    const current = rows[idx];
    const updated = { ...current, ...data };
    await updateSheetRow(SHEETS.SKILLS, idx, [
        updated.id,
        updated.name,
        updated.category,
        updated.level,
        updated.icon,
        updated.sort_order,
        updated.published,
    ]);
}

export async function deleteSkill(id: string): Promise<void> {
    const rows = await getSkills();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Skill ${id} tidak ditemukan`);
    await deleteSheetRow(SHEETS.SKILLS, idx);
}

// ── Services ──────────────────────────────────────────────────────────────────

export interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    image: string;
    sort_order: string;
    published: string;
}

export async function getServices(): Promise<Service[]> {
    return (await getSheetRows(SHEETS.SERVICES)) as unknown as Service[];
}

export async function createService(data: Omit<Service, 'id'>): Promise<Service> {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    const values = [
        id,
        data.title,
        data.description,
        data.icon,
        data.image,
        data.sort_order,
        data.published,
    ];
    await appendSheetRow(SHEETS.SERVICES, values);
    return { id, ...data };
}

export async function updateService(id: string, data: Partial<Omit<Service, 'id'>>): Promise<void> {
    const rows = await getServices();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Service ${id} tidak ditemukan`);
    const current = rows[idx];
    const updated = { ...current, ...data };
    await updateSheetRow(SHEETS.SERVICES, idx, [
        updated.id,
        updated.title,
        updated.description,
        updated.icon,
        updated.image,
        updated.sort_order,
        updated.published,
    ]);
}

export async function deleteService(id: string): Promise<void> {
    const rows = await getServices();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Service ${id} tidak ditemukan`);
    await deleteSheetRow(SHEETS.SERVICES, idx);
}

// ── Projects ──────────────────────────────────────────────────────────────────

export interface Project {
    id: string;
    title: string;
    slug: string;
    description: string;
    technologies: string;
    thumbnail: string;
    github_url: string;
    demo_url: string;
    featured: string;
    published: string;
    sort_order: string;
    created_at: string;
    updated_at: string;
}

export async function getProjects(): Promise<Project[]> {
    return (await getSheetRows(SHEETS.PROJECTS)) as unknown as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
    const rows = await getProjects();
    return rows.find((r) => r.slug === slug) ?? null;
}

export async function getProjectById(id: string): Promise<Project | null> {
    const rows = await getProjects();
    return rows.find((r) => r.id === id) ?? null;
}

export async function createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    const now = new Date().toISOString();
    const values = [
        id,
        data.title,
        data.slug,
        data.description,
        data.technologies,
        data.thumbnail,
        data.github_url,
        data.demo_url,
        data.featured,
        data.published,
        data.sort_order,
        now,
        now,
    ];
    await appendSheetRow(SHEETS.PROJECTS, values);
    return { id, ...data, created_at: now, updated_at: now };
}

export async function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'created_at'>>): Promise<void> {
    const rows = await getProjects();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Project ${id} tidak ditemukan`);
    const current = rows[idx];
    const updated = { ...current, ...data, updated_at: new Date().toISOString() };
    await updateSheetRow(SHEETS.PROJECTS, idx, [
        updated.id,
        updated.title,
        updated.slug,
        updated.description,
        updated.technologies,
        updated.thumbnail,
        updated.github_url,
        updated.demo_url,
        updated.featured,
        updated.published,
        updated.sort_order,
        updated.created_at,
        updated.updated_at,
    ]);
}

export async function deleteProject(id: string): Promise<void> {
    const rows = await getProjects();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Project ${id} tidak ditemukan`);
    await deleteSheetRow(SHEETS.PROJECTS, idx);
}

// ── Project Images ────────────────────────────────────────────────────────────

export interface ProjectImage {
    id: string;
    project_id: string;
    image: string;
    caption: string;
    sort_order: string;
    created_at: string;
}

export async function getProjectImages(projectId: string): Promise<ProjectImage[]> {
    const rows = (await getSheetRows(SHEETS.PROJECT_IMAGES)) as unknown as ProjectImage[];
    return rows
        .filter((r) => r.project_id === projectId)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
}

export async function createProjectImage(data: Omit<ProjectImage, 'id' | 'created_at'>): Promise<ProjectImage> {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    const now = new Date().toISOString();
    const values = [id, data.project_id, data.image, data.caption, data.sort_order, now];
    await appendSheetRow(SHEETS.PROJECT_IMAGES, values);
    return { id, ...data, created_at: now };
}

export async function updateProjectImage(id: string, data: Partial<Omit<ProjectImage, 'id' | 'project_id' | 'created_at'>>): Promise<void> {
    const rows = (await getSheetRows(SHEETS.PROJECT_IMAGES)) as unknown as ProjectImage[];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`ProjectImage ${id} tidak ditemukan`);
    const current = rows[idx];
    const updated = { ...current, ...data };
    await updateSheetRow(SHEETS.PROJECT_IMAGES, idx, [
        updated.id,
        updated.project_id,
        updated.image,
        updated.caption,
        updated.sort_order,
        updated.created_at,
    ]);
}

export async function deleteProjectImage(id: string): Promise<ProjectImage> {
    const rows = (await getSheetRows(SHEETS.PROJECT_IMAGES)) as unknown as ProjectImage[];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`ProjectImage ${id} tidak ditemukan`);
    const row = rows[idx];
    await deleteSheetRow(SHEETS.PROJECT_IMAGES, idx);
    return row;
}

export async function deleteProjectImagesByProjectId(projectId: string): Promise<ProjectImage[]> {
    const rows = (await getSheetRows(SHEETS.PROJECT_IMAGES)) as unknown as ProjectImage[];
    const toDelete = rows.filter((r) => r.project_id === projectId);

    // Hapus dari belakang agar index tidak bergeser
    const indices = toDelete.map((img) => rows.indexOf(img)).sort((a, b) => b - a);
    for (const idx of indices) {
        await deleteSheetRow(SHEETS.PROJECT_IMAGES, idx);
    }
    return toDelete;
}

// ── Messages ──────────────────────────────────────────────────────────────────

export interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
    status: string;
}

export async function getMessages(): Promise<Message[]> {
    const rows = (await getSheetRows(SHEETS.MESSAGES)) as unknown as Message[];
    return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getMessageById(id: string): Promise<Message | null> {
    const rows = (await getSheetRows(SHEETS.MESSAGES)) as unknown as Message[];
    return rows.find((r) => r.id === id) ?? null;
}

export async function createMessage(data: Omit<Message, 'id' | 'created_at' | 'status'>): Promise<Message> {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    const now = new Date().toISOString();
    const values = [id, data.name, data.email, data.subject, data.message, now, 'unread'];
    await appendSheetRow(SHEETS.MESSAGES, values);
    return { id, ...data, created_at: now, status: 'unread' };
}

export async function updateMessageStatus(id: string, status: string): Promise<void> {
    const rows = (await getSheetRows(SHEETS.MESSAGES)) as unknown as Message[];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Message ${id} tidak ditemukan`);
    const current = rows[idx];
    await updateSheetRow(SHEETS.MESSAGES, idx, [
        current.id,
        current.name,
        current.email,
        current.subject,
        current.message,
        current.created_at,
        status,
    ]);
}

export async function deleteMessage(id: string): Promise<void> {
    const rows = (await getSheetRows(SHEETS.MESSAGES)) as unknown as Message[];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Message ${id} tidak ditemukan`);
    await deleteSheetRow(SHEETS.MESSAGES, idx);
}
