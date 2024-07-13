"use client";
import React, { useContext } from 'react';
import Image from 'next/image';
import { ThemeContext } from '../../context/ThemeContext'; // Ensure you have the correct path

const Footer = () => {
  const { changeTheme } = useContext(ThemeContext);

  return (
    <footer className="footer p-4 w-full bg-base-300 text-base-content mt-auto shadow-lg flex justify-between items-center">
      <p>&copy; 2023/34 Viagens em Casa. Projeto de Engenharia Informática.</p>
      <div className="flex items-center gap-5">
        <Image src="/images/ipb_logo.png" alt="IPB Logo" width={180} height={50} />
        <div className="flex gap-5">
        </div>
      </div>
    </footer>
  );
};

export default Footer;
