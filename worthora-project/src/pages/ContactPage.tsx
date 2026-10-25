import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle2, MapPin, Building2 } from 'lucide-react';

interface ContactPageProps {
  onBack: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('review-request');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-3xl p-6 sm:p-12 shadow-sm space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reviews</span>
        </button>

        <div className="flex items-center gap-3 pb-6 border-b border-stone-200">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              Editorial Inquiries & Testing Requests
            </h1>
            <p className="text-xs text-stone-500 font-mono">
              Worthora Laboratory • Feedback, Bench Suggestions & Inquiries
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
          {/* Contact Details Side */}
          <div className="md:col-span-5 space-y-5 text-xs sm:text-sm text-stone-600">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>Worthora Testing Facilities</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Consumer Bench Division & Testing Lab
              </p>
              <div className="flex items-center gap-2 text-stone-700 text-xs pt-1">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>Chicago Research Park, IL 60607</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Guidelines for Manufacturers:
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                If you are a tool or consumer electronics manufacturer wishing to loan a production unit for stress testing, note that loan submission does not guarantee positive scoring. All results are published strictly in accordance with test bench metrics.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-7">
            {submitted ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-950">Inquiry Received</h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Thank you for reaching out to the Worthora editorial board. Our testing coordinator will review your message within 24 to 48 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. David Miller"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Your Contact Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. reader@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Inquiry Purpose</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm outline-hidden focus:border-amber-500"
                  >
                    <option value="review-request">Suggest a Product Comparison Shootout</option>
                    <option value="data-correction">Submit Testing Specification Correction</option>
                    <option value="manufacturer-loan">Manufacturer Unit Loan Request</option>
                    <option value="general-editorial">General Editorial Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Provide details about the hardware model or inquiry..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm outline-hidden focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry to Editorial Board</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
