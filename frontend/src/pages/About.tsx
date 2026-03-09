import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Users,
  Building2,
  Stethoscope,
  Shield,
  DollarSign,
} from "lucide-react";

const About = () => {
  const purposes = [
    {
      icon: Users,
      title: "Dog Breeders",
      description:
        "Professional breeding program management with complete litter tracking and health records",
    },
    {
      icon: Shield,
      title: "Dog Trainers",
      description:
        "Track training progress, certifications, and behavioral development",
    },
    {
      icon: Building2,
      title: "K9 Organizations",
      description:
        "Manage working dog deployments, equipment, and operational readiness",
    },
    {
      icon: Stethoscope,
      title: "Kennel Managers",
      description:
        "Centralized facility management with health monitoring and care schedules",
    },
  ];

  const achievements = [
    "Centralized dog database",
    "Complete dog life-cycle tracking",
    "Breeding program management",
    "Full training monitoring",
    "Health & veterinary management",
    "Deployment tracking",
    "Automated reminders",
    "Media/document uploads",
    "Equipment & kennel management",
    "Financial tracking",
    "Regulatory compliance",
    "Performance analytics",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light via-background to-secondary-light py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Our
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Dog Management Platform
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A comprehensive solution designed to support the entire dog care ecosystem —
              from breeding programs and training operations to working K9 deployments
              and kennel management. We provide the tools professionals need to deliver
              excellence in every aspect of canine care and operations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Platform Purpose */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Who We Serve
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for professionals across the entire dog care industry
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {purposes.map((purpose, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 h-full text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <purpose.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{purpose.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {purpose.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What We Achieve */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What the System Achieves
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive features that cover every aspect of professional dog management
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-center gap-3 p-4 rounded-lg bg-card hover:bg-primary-light/50 transition-colors group"
                >
                  <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-foreground font-medium">{achievement}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8 md:p-12 bg-gradient-card shadow-xl">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Why Choose Our Platform?
              </h2>
              <div className="space-y-6 text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground">Complete Integration:</strong> Unlike
                  fragmented solutions, our platform brings together breeding, training,
                  health, and financial management in one cohesive system.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Professional Standards:</strong> Built
                  with input from industry professionals, ensuring every feature meets the
                  real-world needs of breeders, trainers, and K9 operations.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Scalable Solution:</strong> Whether
                  you're managing a small breeding program or a large K9 unit, our platform
                  scales with your operation while maintaining simplicity and ease of use.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Data-Driven Insights:</strong> Make
                  informed decisions with comprehensive reporting and analytics that track
                  performance, health trends, and financial metrics.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
