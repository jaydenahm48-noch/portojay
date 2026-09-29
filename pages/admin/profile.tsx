import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';

type ProfileData = Record<string, string>;

export default function AdminProfile() {
    const [profile, setProfile] = useState<ProfileData>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingCv, setUploadingCv] = useState(false);

    useEffect(() => {
        fetch('/api/admin/profile')
            .then((r) => r.json())
            .then((d) => { if (d.success) setProfile(d.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    function handleChange(key: string, value: string) {
        setProfile((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const res = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            const d = await res.json();
            setMsg({ type: d.success ? 'success' : 'error', text: d.success ? 'Profile berhasil disimpan!' : (d.error || 'Gagal menyimpan') });
        } catch {
            setMsg({ type: 'error', text: 'Terjadi kesalahan.' });
        } finally {
            setSaving(false);
        }
    }

    async function handleUpload(e: ChangeEvent<HTMLInputElement>, type: 'profile' | 'cv') {
        const file = e.target.files?.[0];
        if (!file) return;
        const setter = type === 'profile' ? setUploadingPhoto : setUploadingCv;
        setter(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            if (profile.profile_image && type === 'profile') formData.append('oldFileId', profile.profile_image);
            if (profile.cv_file && type === 'cv') formData.append('oldFileId', profile.cv_file);

            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const d = await res.json();
            if (d.success) {
                const key = type === 'profile' ? 'profile_image' : 'cv_file';
                const newProfile = { ...profile, [key]: d.fileId };
                setProfile(newProfile);
                // Auto-save ke sheet
                await fetch('/api/admin/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ [key]: d.fileId }),
                });
                setMsg({ type: 'success', text: `${type === 'profile' ? 'Foto profil' : 'CV'} berhasil diupload!` });
            } else {
                setMsg({ type: 'error', text: d.error || 'Upload gagal' });
            }
        } catch {
            setMsg({ type: 'error', text: 'Upload gagal.' });
        } finally {
            setter(false);
            e.target.value = '';
        }
    }

    const fields = [
        { key: 'name', label: 'Nama', type: 'text' },
        { key: 'role', label: 'Role/Jabatan', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Telepon', type: 'text' },
        { key: 'location', label: 'Kota', type: 'text' },
        { key: 'website', label: 'Website', type: 'text' },
        { key: 'instagram', label: 'Instagram', type: 'text' },
        { key: 'github', label: 'GitHub URL', type: 'url' },
        { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
        { key: 'freelance', label: 'Status Freelance', type: 'text' },
    ];

    if (loading) {
        return <AdminLayout title="Profile"><div className="text-gray-400 py-20 text-center">Memuat...</div></AdminLayout>;
    }

    return (
        <>
            <Head><title>Profile — Admin</title></Head>
            <AdminLayout title="Edit Profile">
                <div className="max-w-2xl">
                    {/* Profile Image & CV */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="font-semibold text-gray-800 mb-4">Media</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Foto Profil */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Foto Profil</p>
                                {profile.profile_image && (
                                    <img
                                        src={`https://drive.google.com/uc?export=view&id=${profile.profile_image}`}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover mb-3 border border-gray-200"
                                    />
                                )}
                                <label className="cursor-pointer inline-flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                                    {uploadingPhoto ? 'Mengupload...' : '📷 Ganti Foto'}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'profile')} disabled={uploadingPhoto} />
                                </label>
                            </div>
                            {/* CV */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">CV / Resume</p>
                                {profile.cv_file && (
                                    <a href={`https://drive.google.com/uc?export=view&id=${profile.cv_file}`} target="_blank" rel="noopener"
                                        className="text-xs text-indigo-600 underline mb-3 block">
                                        Lihat CV saat ini
                                    </a>
                                )}
                                <label className="cursor-pointer inline-flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                                    {uploadingCv ? 'Mengupload...' : '📄 Upload CV'}
                                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleUpload(e, 'cv')} disabled={uploadingCv} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Form Info */}
                    <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-800 mb-4">Informasi Profil</h2>
                        <div className="space-y-4">
                            {/* Bio (textarea) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    value={profile.bio ?? ''}
                                    onChange={(e) => handleChange('bio', e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Deskripsi singkat tentang diri Anda..."
                                />
                            </div>
                            {/* Dynamic fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {fields.map((f) => (
                                    <div key={f.key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                                        <input
                                            type={f.type}
                                            value={profile[f.key] ?? ''}
                                            onChange={(e) => handleChange(f.key, e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {msg && (
                            <div className={`mt-4 text-sm px-4 py-3 rounded-lg ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {msg.text}
                            </div>
                        )}

                        <div className="mt-5">
                            <button type="submit" disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
                                {saving ? 'Menyimpan...' : 'Simpan Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>
        </>
    );
}
