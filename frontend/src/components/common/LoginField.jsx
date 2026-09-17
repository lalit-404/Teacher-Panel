import React from "react";

export default function LoginField({ icon: Icon, ...inputProps }) {
  return (
    <div className="tp-field">
      <Icon size={16} />
      <input {...inputProps} />
    </div>
  );
}
