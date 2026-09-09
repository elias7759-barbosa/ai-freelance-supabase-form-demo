import ContactForm from "./contact-form";
export default function Contact() {
  return (
    <section className="contact">
      <div>
        <p className="eyebrow">CONTACT FORM</p>
        <h1>Send a message.</h1>
        <p>Your message is confirmed only after the database accepts it.</p>
        <p className="note">
          Demo only. Use fictional details and an example.test email address.
        </p>
      </div>
      <ContactForm />
    </section>
  );
}
