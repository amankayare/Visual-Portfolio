import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Eye, Github, Terminal, Globe, Star, Award } from "lucide-react";

// Import the Professional-summary.jpg image and resume PDF
import professionaImage from "../../../assets/Professional-summary.jpg";
import resumePdf from "../../../assets/Aman Resume.pdf";

interface AboutData {
  name: string;
  headline: string;
  bio: string;
  photo?: string;
  location: string;
  email: string;
  phone: string;
  social_links: Record<string, string>;
}

interface TechnicalSkill {
  id: number;
  title: string;
  skills: string[];
  color: string;
  icon: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
  credential_url?: string;
  image?: string;
  description?: string;
  skills?: string[];
  certificate_id?: string;
  expiration_date?: string;
}

const DynamicAboutContent = () => {
  const {
    data: about,
    isLoading: aboutLoading,
    error: aboutError,
  } = useQuery({
    queryKey: ["/api/about/"],
    queryFn: async (): Promise<AboutData> => {
      const response = await fetch("/api/about/");
      if (!response.ok) throw new Error("Failed to fetch about data");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: certifications, isLoading: certificationsLoading } = useQuery({
    queryKey: ["/api/certifications/"],
    queryFn: async (): Promise<Certification[]> => {
      const response = await fetch("/api/certifications/");
      if (!response.ok) throw new Error("Failed to fetch certifications");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: technicalExpertise, isLoading: techSkillsLoading } = useQuery({
    queryKey: ["/api/technical-skills/"],
    queryFn: async (): Promise<TechnicalSkill[]> => {
      const response = await fetch("/api/technical-skills/");
      if (!response.ok) throw new Error("Failed to fetch technical skills");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Icon mapping for technical skills
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className="w-8 h-8 text-white" />;
      case 'Globe':
        return <Globe className="w-8 h-8 text-white" />;
      default:
        return <Terminal className="w-8 h-8 text-white" />;
    }
  };

  if (aboutLoading || techSkillsLoading) {
    return (
      <div className="hero-grid hero-squares p-4 sm:p-8 lg:px-16 xl:px-20 vs-scrollbar overflow-auto h-full">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading about information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (aboutError || !about) {
    return (
      <div className="hero-grid hero-squares p-4 sm:p-8 lg:px-16 xl:px-20 vs-scrollbar overflow-auto h-full">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">
                Failed to load about information
              </p>
              <p className="text-muted-foreground text-sm">
                Please check your connection and try again
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-grid hero-squares p-4 sm:p-8 lg:px-16 xl:px-20 vs-scrollbar overflow-auto h-full">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold mb-8 lg:mb-12 text-foreground flex items-center">
          <User className="mr-4 text-primary flex-shrink-0" />
          About Me
        </h1>

        {/* Main About Section with Image and Professional Summary */}
        <div className="hero-grid grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
          <div>
            <div className="w-full h-[300px] sm:h-[400px] gradient-bg rounded-2xl shadow-2xl relative flex items-center justify-center overflow-hidden">
              <a href="http://www.freepik.com">
                <img
                  src={professionaImage}
                  alt={about.name}
                  className="w-full h-full object-cover object-top rounded-2xl"
                />
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-foreground">
              Professional Summary
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{about.bio}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                className="bg-primary text-white btn-enhanced rounded-lg"
                onClick={() => window.open(resumePdf, "_blank")}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Resume
              </Button>

              {about.social_links.github && (
                <a
                  href={about.social_links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="btn-enhanced rounded-lg">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub Profile
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Technical Expertise Section */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-2xl md:text-[1.75rem] lg:text-3xl font-semibold mb-6 lg:mb-8 text-foreground">
            Technical Expertise
          </h2>
          <div className="skills-grid grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
            {technicalExpertise && technicalExpertise.map((category) => (
              <Card
                key={category.title}
                className="h-auto min-h-[18rem] md:min-h-[20rem] lg:min-h-[22rem] flex flex-col hover-lift rounded-lg shadow-md"
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground text-lg md:text-base lg:text-lg font-semibold">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${category.color} mr-3`}
                    >
                      {getIcon(category.icon)}
                    </div>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 p-4 lg:p-6">
                  <ul className="space-y-3 flex-1">
                    {category.skills.map((skill) => (
                      <li
                        key={skill}
                        className="flex items-start text-muted-foreground text-sm md:text-[0.925rem] lg:text-base break-words leading-snug"
                      >
                        <Star className="w-4 h-4 text-primary mr-2 mt-1 flex-shrink-0" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Education & Achievements Section */}
        <div>
          <h2 className="text-xl sm:text-2xl md:text-[1.75rem] lg:text-3xl font-semibold mb-5 sm:mb-6 lg:mb-8 text-foreground">
            Education & Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-7 lg:gap-8">
            {/* Hardcoded Education Card */}
            <Card className="flex flex-col h-full rounded-lg shadow-md hover-lift transition-all duration-300">
              <CardContent className="p-4 md:p-6 flex flex-col flex-1 justify-between">
                <div className="flex items-start">
                  <div className="gradient-bg p-3 rounded-lg mr-4 flex-shrink-0">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-md md:text-base lg:text-lg text-foreground mb-1 leading-snug break-words">
                      Post Graduate Diploma in Advanced Computing (PG-DAC)
                    </h3>
                    <p className="text-primary font-medium mb-1 text-sm md:text-base">
                      Central Govt.
                    </p>
                    <p className="text-muted-foreground text-xs md:text-sm leading-snug">
                      2020 - 2021 | 77.6 Percentile
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Certification Cards */}
            {!certificationsLoading &&
              certifications &&
              certifications.slice(0, 2).map((cert) => (
                <Card
                  key={cert.id}
                  className="flex flex-col h-full rounded-lg shadow-md hover-lift transition-all duration-300"
                >
                  <CardContent className="p-4 md:p-6 flex flex-col flex-1 justify-between">
                    <div className="flex items-start">
                      <div className="gradient-bg p-3 rounded-lg mr-4 flex-shrink-0">
                        <Star className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-md md:text-base lg:text-lg text-foreground mb-1 leading-snug break-words">
                          {cert.name}
                        </h3>
                        <p className="text-primary font-medium mb-1 text-sm md:text-base">
                          {cert.issuer}
                        </p>
                        <p className="text-muted-foreground text-xs md:text-sm leading-snug">
                          {cert.date}{" "}
                          {cert.expiration_date &&
                            `| Valid until: ${cert.expiration_date}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicAboutContent;
