'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
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
  onSave: (data: FormData) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ...user,
    birthDate: new Date(user.birthDate),
  });

  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(user.image);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({ ...prev, birthDate: date }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: file }));
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key] instanceof File) {
        data.append(key, formData[key]);
      } else {
        data.append(key, formData[key] as string);
      }
    });
    onSave(data);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="modal modal-open bg-base-100 shadow-xl rounded-lg p-6">
        <div className="modal-box">
          <h2 className="text-xl font-bold mb-4">Editar Dados de Perfil</h2>
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Imagem de Perfil</label>
              <div className="flex items-center mb-4">
                <img
                  src={imagePreview as string}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border border-gray-300"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="ml-4 file-input file-input-bordered"
                />
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
              <DatePicker
                selected={formData.birthDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
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
