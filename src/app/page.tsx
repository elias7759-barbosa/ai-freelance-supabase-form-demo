import Link from "next/link";
export default function Home() {
  return (
    <section className="intro">
      <p className="eyebrow">FROM INPUT TO PERSISTENCE</p>
      <h1>
        A form is only useful
        <br />
        when the data arrives.
      </h1>
      <p>
        A focused demonstration of validated form submission, secure database
        access, and honest success feedback.
      </p>
      <Link className="button" href="/contact">
        Try the contact form →
      </Link>
      <div className="steps">
        01 Validate <span>→</span> 02 Persist <span>→</span> 03 Confirm
      </div>
    </section>
  );
}
