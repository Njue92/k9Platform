import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Heart,
  GraduationCap,
  FileText,
  Activity,
  DollarSign,
  Bell,
  Database,
  Shield,
  Users,
} from "lucide-react";
import heroImage from "@/assets/hero-dogs.jpg";

const Home = () => {
  const features = [
    {
      icon: Heart,
      title: "Health Tracking",
      description: "Complete veterinary records, vaccinations, and medical history",
      color: "text-secondary",
    },
    {
      icon: GraduationCap,
      title: "Training Records",
      description: "Monitor progress, certifications, and skill development",
      color: "text-primary",
    },
    {
      icon: FileText,
      title: "Breeding History",
      description: "Track lineage, litters, and genetic information",
      color: "text-accent",
    },
    {
      icon: Activity,
      title: "Deployment Logs",
      description: "Record working dog assignments and performance",
      color: "text-secondary",
    },
    {
      icon: DollarSign,
      title: "Financial Tracking",
      description: "Manage expenses, revenues, and profitability",
      color: "text-primary",
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never miss important dates and appointments",
      color: "text-accent",
    },
  ];

  const quickLinks = [
    {
      title: "Breeders Module",
      description: "Manage breeding programs, litters, and puppy sales",
      icon: Heart,
      link: "/breeders",
      gradient: "from-secondary to-secondary-light",
    },
    {
      title: "Trainers Module",
      description: "Track K9 training, certifications, and deployments",
      icon: GraduationCap,
      link: "/trainers",
      gradient: "from-primary to-primary-dark",
    },
    {
      title: "Dog Profiles",
      description: "Complete life-cycle management for every dog",
      icon: Database,
      link: "/breeders",
      gradient: "from-accent to-accent/80",
    },
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-light via-background to-secondary-light">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Professional Dog
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  Management Platform
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Complete solution for dog breeders, trainers, and K9 working dog operations.
                Track health, training, breeding, and deployments all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-gradient-primary shadow-primary">
                  <Link to="/auth">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={heroImage}
                  alt="Professional dog management"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Links Grid */}
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
              Choose Your Module
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access specialized tools designed for breeders, trainers, or K9 operations
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {quickLinks.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link to={item.link}>
                  <Card className="p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-card group cursor-pointer">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
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
              Powerful Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your breeding and training operations professionally
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 h-full hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                  <feature.icon
                    className={`h-10 w-10 mb-4 ${feature.color} group-hover:scale-110 transition-transform`}
                  />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Join professional breeders and trainers who trust our platform
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link to="/auth">Create Account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <Link to="/about">View Features</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
