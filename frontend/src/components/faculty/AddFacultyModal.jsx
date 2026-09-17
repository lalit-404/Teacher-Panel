import React from "react";
import Modal from "../common/Modal";
import ManualFacultyForm from "./ManualFacultyForm";

export default function AddFacultyModal({ onClose, onAddManual }) {
  return (
    <Modal title="Add faculty" onClose={onClose} maxWidth={440}>
      <ManualFacultyForm onBack={onClose} onSubmit={onAddManual} />
    </Modal>
  );
}
