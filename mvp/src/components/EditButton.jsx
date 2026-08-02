import React from 'react';
import { Edit2 } from 'lucide-react';

const EditButton = ({ onClick }) => {
  return (
    <button className="edit-btn" onClick={onClick} type="button">
      <span>Editar</span>
      <Edit2 size={16} />
    </button>
  );
};

export default EditButton;