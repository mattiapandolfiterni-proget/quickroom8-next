import { Header } from "@/components/Header";
import { Shield, Eye, MessageSquare, Home, AlertTriangle, CheckCircle } from "lucide-react";

const SafetyTips = () => {
  const tips = [
    {
      icon: Eye,
      title: "Meet in Person First",
      description: "Always view the property and meet potential flatmates in person before committing. Arrange meetings in public places initially."
    },
    {
      icon: Shield,
      title: "Verify Identity",
      description: "Look for verified badges on profiles. Ask for ID verification and references before making any commitments or payments."
    },
    {
      icon: MessageSquare,
      title: "Keep Communication on Platform",
      description: "Use Quickroom8's messaging system for all communications. This helps us protect you and provides a record if issues arise."
    },
    {
      icon: Home,
      title: "Inspect the Property",
      description: "Thoroughly inspect the room and common areas. Take photos, check for damages, and ensure amenities listed are present."
    },
    {
      icon: AlertTriangle,
      title: "Avoid Advance Payments",
      description: "Never send money before viewing the property. Be cautious of requests for large deposits or payments via wire transfer."
    },
    {
      icon: CheckCircle,
      title: "Trust Your Instincts",
      description: "If something feels wrong or too good to be true, trust your gut. Report suspicious listings or behavior immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Safety Tips</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your safety is our priority. Follow these guidelines to have a secure experience 
            when searching for rooms and meeting potential flatmates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <tip.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{tip.title}</h3>
                  <p className="text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-destructive flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Red Flags to Watch For
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">•</span>
              <span>Requests for payment before viewing the property</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">•</span>
              <span>Pressure to make quick decisions without proper consideration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">•</span>
              <span>Unwillingness to meet in person or show the property</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">•</span>
              <span>Prices significantly below market rate without clear explanation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">•</span>
              <span>Vague or inconsistent information about the property or flatmates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">•</span>
              <span>Requests to move communication off the platform immediately</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Need Help?</h2>
          <p className="text-muted-foreground mb-4">
            If you encounter suspicious behavior, scams, or feel unsafe, please report it immediately. 
            Our team is here to help ensure a safe experience for all users.
          </p>
          <div className="flex gap-4">
            <a
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Report an Issue
            </a>
            <a
              href="/messages"
              className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyTips;
