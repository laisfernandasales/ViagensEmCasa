'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSession } from 'next-auth/react';
import 'react-datepicker/dist/react-datepicker.css';

interface EditProfileProps {
  user: {
    name: string;
    username: string;
    email: string;
    phone: string;
    birthDate: string;
    gender: string;
    shippingAddress: string;
    billingAddress: string;
    image: string;
  };
  onClose: () => void;
  onSave: (data: any) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...user });
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(user.image);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setSession(session || null);
      setLoading(false);
    })();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(user.image);
      setSelectedFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!session) return setError('No session found');

    const data = {
      name: formData.name,
      phone: formData.phone || null,
      birthDate: formData.birthDate || null,
      gender: formData.gender || null,
      shippingAddress: formData.shippingAddress || null,
      billingAddress: formData.billingAddress || null
    };

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': session.user.id
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error((await response.json()).error || response.statusText);

      onSave(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar dados do usuário.');
    }
  };

  const handlePostImage = useCallback(async () => {
    if (!session || !selectedFile) return setError('No session found');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/profile/update-image', {
        method: 'POST',
        headers: { 'user-id': session.user.id },
        body: formData,
      });

      if (!response.ok) throw new Error((await response.json()).error || response.statusText);

      setSelectedFile(null);
      setError(null);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar a imagem.');
    }
  }, [selectedFile, session]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="modal modal-open bg-base-100 shadow-xl rounded-lg p-6">
        <div className="modal-box">
          <h2 className="text-xl font-bold mb-4">Editar Dados de Perfil</h2>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Imagem de Perfil</label>
              <div className="flex flex-col items-center mb-4">
                <img src={imagePreview as string} alt="Preview" className="w-24 h-24 rounded-full object-cover border border-gray-300" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="mt-4 file-input file-input-bordered" />
                {selectedFile && <button type="button" onClick={handlePostImage} className="btn btn-primary mt-4">Mudar Imagem</button>}
              </div>
            </div>
            {[
              { label: 'Nome', type: 'text', name: 'name', value: formData.name, disabled: false },
              { label: 'Username', type: 'text', name: 'username', value: formData.username, disabled: true },
              { label: 'Email', type: 'email', name: 'email', value: formData.email, disabled: true },
              { label: 'Telefone', type: 'text', name: 'phone', value: formData.phone, disabled: false },
              { label: 'Data de Nascimento', type: 'date', name: 'birthDate', value: formData.birthDate, disabled: false },
            ].map(({ label, type, name, value, disabled }) => (
              <div key={name} className="mb-4">
                <label className="block text-sm font-medium mb-2">{label}</label>
                <input type={type} name={name} value={value} onChange={handleFormChange} className="input input-bordered w-full" disabled={disabled} />
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Gênero</label>
              <select name="gender" value={formData.gender} onChange={handleFormChange} className="select select-bordered w-full">
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Não binário">Não binário</option>
              </select>
            </div>
            {[
              { label: 'Endereço de Envio', name: 'shippingAddress', value: formData.shippingAddress },
              { label: 'Endereço de Faturamento', name: 'billingAddress', value: formData.billingAddress },
            ].map(({ label, name, value }) => (
              <div key={name} className="mb-4">
                <label className="block text-sm font-medium mb-2">{label}</label>
                <textarea name={name} value={value} onChange={handleFormChange} className="textarea textarea-bordered w-full h-24" />
              </div>
            ))}
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="btn btn-outline btn-secondary mr-2">Cancelar</button>
              <button type="button" onClick={handleSubmit} className="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
