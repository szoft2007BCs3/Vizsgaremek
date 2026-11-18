const LOGIN_FIELDS = [
  { label: 'E-mail cím', type: 'email', name: 'Email', placeholder: 'pelda@email.hu', autoComplete: 'email' },
  { label: 'Jelszó', type: 'password', name: 'Jelszo', placeholder: 'Jelszó', autoComplete: 'current-password' }
];

const REGISTER_FIELDS = [
  { label: 'Név', type: 'text', name: 'Nev', placeholder: 'Kovács János', autoComplete: 'name' },
  { label: 'E-mail cím', type: 'email', name: 'Email', placeholder: 'pelda@email.hu', autoComplete: 'email' },
  { label: 'Telefonszám', type: 'tel', name: 'Telefonszam', placeholder: '+36 30 123 4567', autoComplete: 'tel' },
  { label: 'Jelszó', type: 'password', name: 'Jelszo', placeholder: 'Jelszó', autoComplete: 'new-password' },
  { label: 'Jelszó még egyszer', type: 'password', name: 'JelszoUjra', placeholder: 'Jelszó még egyszer', autoComplete: 'new-password' }
];

function ProfileCard({ title, intro, fields, submitLabel }) {
  return (
    <section className="panel profile-card">
      <h2 className="panel-title">{title}</h2>
      <p className="profile-intro">{intro}</p>
      <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
        {fields.map((field) => (
          <label className="field" key={field.name}>
            <span>{field.label}</span>
            <input type={field.type} name={field.name} placeholder={field.placeholder} autoComplete={field.autoComplete} />
          </label>
        ))}
        <button type="submit" className="btn-submit">{submitLabel}</button>
      </form>
    </section>
  );
}

export default function Profil() {
  return (
    <main className="profile">
      <ProfileCard title="Bejelentkezés" intro="Jelentkezz be, hogy elérd a mentett terveidet és a rendeléseidet." fields={LOGIN_FIELDS} submitLabel="Bejelentkezés" />
      <ProfileCard title="Regisztráció" intro="Még nincs fiókod? Add meg az adataidat, és hozz létre egyet." fields={REGISTER_FIELDS} submitLabel="Regisztráció" />
    </main>
  );
}
