'use client';

import { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({
    ...user,
    birthDate: user.birthDate, // string date format
  });

  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(user.image);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session) {
        console.log("Session retrieved:", session);
        setSession(session);
      } else {
        console.error('Session not found');
      }
      setLoading(false);
    };
    fetchSession();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, birthDate: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
    if (!session) {
      console.error('No session found');
      setError('No session found');
      return;
    }

    const { id } = session.user; // Obtendo o ID do usuário da sessão

    const data = {
      name: formData.name,
      phone: formData.phone || null,
      birthDate: formData.birthDate || null,
      gender: formData.gender || null,
      shippingAddress: formData.shippingAddress || null,
      billingAddress: formData.billingAddress || null
    };
    
    try {
      console.log('Submitting data:', data); // Adicionado para depuração
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': id // Enviar o ID do usuário nos headers
        },
        body: JSON.stringify(data) // Certifique-se de que o corpo está como JSON
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData); // Adicionado para depuração
        throw new Error(errorData.error || response.statusText);
      }
  
      const result = await response.json();
      console.log('Profile update result:', result); // Adicionado para depuração
      onSave(data);
      setError(null); // Limpa qualquer mensagem de erro anterior
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar dados do usuário.';
      console.error('Erro ao atualizar perfil:', errorMessage); // Adicionado para depuração
      setError(errorMessage);
    }
  };

  const handlePostImage = async () => {
    if (!session) {
      console.error('No session found');
      setError('No session found');
      return;
    }
  
    const { id } = session.user; // Obtendo o ID do usuário da sessão
  
    if (selectedFile) {
      const formData = new FormData();
      formData.append('image', selectedFile);
  
      try {
        const response = await fetch('/api/profile/update-image', {
          method: 'POST',
          headers: {
            'user-id': id // Enviar o ID do usuário nos headers
          },
          body: formData,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response from server:", errorData);
          throw new Error(errorData.error || response.statusText);
        }
  
        console.log("Imagem atualizada com sucesso");
        setSelectedFile(null); // Reset selected file after upload
        setError(null); // Limpa qualquer mensagem de erro anterior
  
        // Recarregar a página após o upload
        window.location.reload();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar a imagem.';
        console.error("Erro ao atualizar imagem:", errorMessage);
        setError(errorMessage);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
                <img
                  src={imagePreview as string}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border border-gray-300"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-4 file-input file-input-bordered"
                />
                {selectedFile ? (
                  <button
                    type="button"
                    onClick={handlePostImage}
                    className="btn btn-primary mt-4"
                  >
                    Mudar Imagem
                  </button>
                ) : null}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                className="input input-bordered w-full"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="input input-bordered w-full"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Telefone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleDateChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Gênero</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleFormChange}
                className="select select-bordered w-full"
              >
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Não binário">Não binário</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Endereço de Envio</label>
              <textarea
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleFormChange}
                className="textarea textarea-bordered w-full h-24"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Endereço de Faturamento</label>
              <textarea
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleFormChange}
                className="textarea textarea-bordered w-full h-24"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline btn-secondary mr-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
