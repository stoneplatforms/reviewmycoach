'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { Elements } from '@stripe/react-stripe-js';
import Image from 'next/image';
import stripePromise from '../lib/stripe-client';
import PaymentForm from './PaymentForm';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  deliverables: string[];
  isActive: boolean;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: {
    id: string;
    displayName: string;
    profileImage?: string;
  };
  services: Service[];
  user: User | null;
}

export default function BookingModal({ isOpen, onClose, coach, services, user }: BookingModalProps) {
  const [step, setStep] = useState(1); // 1: Service Selection, 2: Details, 3: Payment
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    bookingId: string;
    clientSecret: string;
    totalAmount: number;
  } | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    studentName: user?.displayName || '',
    studentEmail: user?.email || '',
    studentPhone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleBookingSubmit = async () => {
    if (!selectedService) return;
    
    setLoading(true);
    setError(null);

    try {
      const idToken = user ? await user.getIdToken() : null;
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          serviceId: selectedService.id,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          notes: formData.notes,
          studentName: formData.studentName,
          studentEmail: formData.studentEmail,
          studentPhone: formData.studentPhone,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPaymentData({
          bookingId: result.bookingId,
          clientSecret: result.clientSecret,
          totalAmount: result.totalAmount,
        });
        setStep(3); // Move to payment step
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    alert('Payment successful! Your booking is confirmed. The coach will contact you soon.');
    onClose();
    resetForm();
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService(null);
    setPaymentData(null);
    setFormData({
      scheduledDate: '',
      scheduledTime: '',
      notes: '',
      studentName: user?.displayName || '',
      studentEmail: user?.email || '',
      studentPhone: '',
    });
    setError(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <Elements stripe={stripePromise}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {coach.profileImage ? (
                <Image 
                  src={coach.profileImage} 
                  alt={coach.displayName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {coach.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Hire {coach.displayName}</h3>
                {selectedService && (
                  <p className="text-gray-600">Booking: {selectedService.title}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose a Service</h4>
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div 
                      key={service.id} 
                      className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h5 className="text-lg font-semibold text-gray-900">{service.title}</h5>
                        <span className="text-xl font-bold text-green-600">${service.price}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{service.duration} minutes</span>
                        <span className="capitalize">{service.category.replace('-', ' ')}</span>
                      </div>
                      {service.deliverables.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">What you'll get:</h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {service.deliverables.slice(0, 3).map((deliverable, index) => (
                              <li key={index} className="flex items-start">
                                <svg className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {deliverable}
                              </li>
                            ))}
                            {service.deliverables.length > 3 && (
                              <li className="text-gray-500">+{service.deliverables.length - 3} more...</li>
                            )}
                          </ul>
                        </div>
                      )}
                      <div className="text-center">
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                          Select This Service
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium text-gray-900">No Services Available</h4>
                  <p className="mt-2 text-gray-600">This coach hasn't set up any services yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Booking Details */}
          {step === 2 && selectedService && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900">Booking Details</h4>
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  ← Change Service
                </button>
              </div>

              {/* Selected Service Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-semibold text-blue-900">{selectedService.title}</h5>
                    <p className="text-blue-800 text-sm">{selectedService.duration} minutes • {selectedService.category.replace('-', ' ')}</p>
                  </div>
                  <span className="text-xl font-bold text-blue-900">${selectedService.price}</span>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      id="scheduledDate"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      id="scheduledTime"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="studentEmail"
                      name="studentEmail"
                      value={formData.studentEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="studentPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="studentPhone"
                    name="studentPhone"
                    value={formData.studentPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any specific goals, questions, or requirements..."
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleBookingSubmit}
                  disabled={loading || !formData.scheduledDate || !formData.scheduledTime || !formData.studentName || !formData.studentEmail}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Booking...' : `Continue to Payment`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && selectedService && paymentData && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-gray-900">Complete Payment</h4>
                <button
                  onClick={() => setStep(2)}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  ← Back to Details
                </button>
              </div>

              {/* Service & Booking Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-semibold text-blue-900">{selectedService.title}</h5>
                    <p className="text-blue-800 text-sm">
                      {formData.scheduledDate} at {formData.scheduledTime} • {selectedService.duration} minutes
                    </p>
                  </div>
                  <span className="text-xl font-bold text-blue-900">${selectedService.price}</span>
                </div>
                <p className="text-blue-800 text-sm">
                  Coach: {coach.displayName} • Student: {formData.studentName}
                </p>
              </div>

              {/* Payment Form */}
              <PaymentForm
                clientSecret={paymentData.clientSecret}
                amount={paymentData.totalAmount}
                serviceName={selectedService.title}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                loading={loading}
                setLoading={setLoading}
                initialBillingData={{
                  name: formData.studentName,
                  email: formData.studentEmail,
                }}
              />
            </div>
          )}

          {/* How it Works Info */}
          {step === 1 && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Choose and book a service</li>
                <li>Provide your contact details and preferences</li>
                <li>Pay securely through our platform</li>
                <li>Coach delivers the session and any promised deliverables</li>
                <li>Payment is released to the coach only after completion</li>
                <li>Leave a review to help other students</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
    </Elements>
  );
} 