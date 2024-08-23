import { subtitle, title } from "@/components/primitives";

export default function AboutPage() {
  return (
    <section>
      <h1>About Voxemo</h1>
      <p><strong>Voxemo:</strong> Real-time sentiment analyzer and reflective content generator.</p>
      
      <h2>Overview</h2>
      <p>
        Voxemo is a real-time tool that analyzes emotional sentiment from speech and translates it across various forms, 
        including visual and musical artwork. It serves as both an emotional translator and an expressive instrument, 
        helping users understand and convey emotions more effectively.
      </p>

      <h2>Key Use Cases</h2>
      <ul>
        <li>
          <strong>Communication Assistance:</strong> Supports individuals with social-cognitive challenges or speech 
          difficulties in expressing and understanding emotions.
        </li>
        <li>
          <strong>Enhanced Communication:</strong> Offers real-time note summarization and rephrasing for clearer, 
          more effective communication.
        </li>
        <li>
          <strong>Daily Activity Summaries:</strong> Provides summaries of daily activities, contextualized with 
          location data and alerts to avoid negative emotional states.
        </li>
      </ul>
    </section>
  );
}
