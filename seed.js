const prisma = require('./backend/prisma');

async function main() {
  console.log("Seeding database...");

  // Delete existing records to start clean
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.project.deleteMany();
  await prisma.authenticator.deleteMany();
  await prisma.profile.deleteMany();

  // 1. Create Profile
  const profile = await prisma.profile.create({
    data: {
      fullName: "Darinel Aizprua",
      email: "darinelaizprua@gmail.com",
      phone: "+52 123-456-7890",
      github: "https://github.com/darinelaizp",
      linkedin: "https://www.linkedin.com/in/darinelaizp/",
      portfolio: "https://darinelaizp.dev",
      bio: "Full Stack Engineer specializing in developing premium minimalist web applications, automation pipelines, and robust SaaS tools.",
      skills: "React, Node.js, Express, JavaScript, TypeScript, SQLite, Prisma, CSS, Docker, Puppeteer",
      resumeText: "SUMMARY:\nExperienced Full Stack Engineer with expertise in building responsive single-page applications and automated integrations.\n\nEXPERIENCE:\n- Senior Full Stack Developer (2024 - Present):\n  Designed responsive dashboards and automated web scraping systems, saving 20+ hours weekly.\n- Software Engineer (2022 - 2024):\n  Engineered robust RESTful APIs in Express and optimized SQL databases for high throughput.",
      experience: "Senior Developer with a proven record of building clean SaaS architectures.",
      publicSlug: "fullstack",
      publicActive: true
    }
  });

  console.log("Created Profile:", profile.fullName);

  // 2. Create Projects
  const project1 = await prisma.project.create({
    data: {
      profileId: profile.id,
      title: "MyJobsBoard SaaS Platform",
      description: "An automated job-scraping and AI-assisted applying platform with clean minimalist Apple aesthetics.",
      technologies: "React, Node.js, SQLite, Prisma, OpenRouter API",
      liveUrl: "https://myjobsboard.dev",
      githubUrl: "https://github.com/darinelaizp/myjobsboard"
    }
  });

  const project2 = await prisma.project.create({
    data: {
      profileId: profile.id,
      title: "Algorithmic Risk Dashboard",
      description: "A real-time dashboard for automated risk management and portfolio rebalancing.",
      technologies: "TypeScript, React, WebSockets, TailwindCSS",
      liveUrl: "https://riskdashboard.dev",
      githubUrl: "https://github.com/alexrivera/risk-dashboard"
    }
  });

  console.log("Created Projects:", project1.title, ",", project2.title);

  // 3. Create a default Job to play with immediately
  const job = await prisma.job.create({
    data: {
      title: "Senior React Developer",
      company: "InnovateTech",
      location: "Remote, US/Europe",
      salary: "$120,000 - $140,000",
      tags: "React, JavaScript, CSS, TypeScript",
      description: "We are looking for a Senior React Developer to join our fully remote team. You will lead the development of our flagship user dashboard, focusing on stellar performance, beautiful modern aesthetics, and seamless user experiences. Strong skills in custom CSS, state management, and modern React hooks are required.",
      applyUrl: "https://innovatetech.com/jobs/apply-react",
      source: "weworkremotely",
      externalId: "wwr-99999",
      datePosted: new Date()
    }
  });

  console.log("Created Starter Job:", job.title);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
