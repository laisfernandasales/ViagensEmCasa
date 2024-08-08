'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/services/cart/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { getSession } from 'next-auth/react';

const CheckoutPage: React.FC = () => {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [nif, setNif] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const deliveryFee = 5.0;
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  const totalWithDelivery = (parseFloat(cartTotal) + deliveryFee).toFixed(2);

  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Obtenha o locale da URL

  useEffect(() => {
    const fetchUserData = async () => {
      const session = await getSession();
      if (session) {
        setSession(session);
        const response = await fetch(`/api/profile?userId=${session.user.id}`);
        const data = await response.json();
        setName(data.name || '');
        setNif(data.nif || '');
        setContactNumber(data.contactNumber || '');
        setBillingAddress(data.billingAddress || '');
        setShippingAddress(data.shippingAddress || '');
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          nif,
          contactNumber,
          billingAddress,
          shippingAddress,
          paymentMethod,
          items: cart,
        }),
      });

      if (response.ok) {
        clearCart();
        router.push(`/${locale}/checkout/order-success`);
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao realizar a compra');
      }
    } catch (error) {
      console.error('Erro ao realizar a compra:', error);
      alert('Erro ao realizar a compra');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-base-300 shadow-lg rounded-lg p-6">
        <h1 className="text-4xl font-bold mb-6 text-center text-base-content">Checkout</h1>
        {cart.length === 0 ? (
          <p className="text-center text-xl text-base-content">Your cart is empty</p>
        ) : (
          <div>
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-base-content">Shipping Details</h2>
              {[
                { label: 'Name', value: name, setValue: setName, placeholder: 'Enter your name' },
                { label: 'NIF', value: nif, setValue: setNif, placeholder: 'Enter your NIF' },
                { label: 'Contact Number', value: contactNumber, setValue: setContactNumber, placeholder: 'Enter your contact number' },
                { label: 'Billing Address', value: billingAddress, setValue: setBillingAddress, placeholder: 'Enter your billing address' },
                { label: 'Shipping Address', value: shippingAddress, setValue: setShippingAddress, placeholder: 'Enter your shipping address' },
              ].map(({ label, value, setValue, placeholder }, index) => (
                <div className="mb-4" key={index}>
                  <label className="block text-base-content mb-1">{label}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </section>
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-base-content">Payment Method</h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </section>
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-base-content">Order Summary</h2>
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 mb-4 bg-base-100 shadow-lg rounded-lg">
                  <div className="flex items-center">
                    <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-lg mr-4" />
                    <div>
                      <h3 className="text-xl font-semibold text-base-content">{item.productName}</h3>
                      <p className="text-base-content">€{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="btn btn-circle btn-sm bg-transparent border border-base-content text-base-content hover:bg-base-200"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-base-content">{item.quantity}</span>
                    <button
                      className="btn btn-circle btn-sm bg-transparent border border-base-content text-base-content hover:bg-base-200"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="btn btn-sm bg-transparent border border-base-content text-base-content rounded-full hover:bg-base-200"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </section>
            <div className="text-2xl font-semibold text-base-content mb-4">
              Delivery Fee: €{deliveryFee.toFixed(2)}
            </div>
            <div className="text-2xl font-semibold text-base-content mb-4">
              Total: €{totalWithDelivery}
            </div>
            <button className="btn btn-primary w-full" onClick={handleCheckout}>
              Place Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <span className="loading loading-spinner loading-lg"></span>
  </div>
);
