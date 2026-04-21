"use client";

const SUBJECTS = [
  "Renseignement véhicule",
  "Renseignement immobilier",
  "Réservation",
  "Service après-vente",
  "Partenariat",
  "Autre",
];

export default function ContactForm() {
  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nom complet *
          </label>
          <input
            type="text"
            placeholder="Votre nom"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Téléphone
          </label>
          <input
            type="tel"
            placeholder="+225..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Email *
        </label>
        <input
          type="email"
          placeholder="votre@email.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Sujet *
        </label>
        <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition text-gray-600">
          <option value="">Choisissez un sujet</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Message *
        </label>
        <textarea
          rows={5}
          placeholder="Décrivez votre besoin..."
          maxLength={500}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B5E20] transition resize-none"
        />
        <p className="text-right text-xs text-gray-400 mt-1">0/500</p>
      </div>

      <button
        type="submit"
        className="w-full bg-[#1B5E20] text-white rounded-xl py-4 font-semibold text-sm hover:bg-[#2E7D32] transition"
      >
        Envoyer le message
      </button>
    </form>
  );
}
