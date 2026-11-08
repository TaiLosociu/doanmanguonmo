'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import NeonBanner from '../components/NeonBanner';
import Pillars from '../components/Pillars';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Experience from '../components/Experience';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import {
  fetchProfile,
  fetchSkills,
  fetchProjects,
  fetchExperiences,
  fetchHealth,
} from '../lib/api';
import { Profile, Skill, Project, Experience as ExpType, HealthStatus } from '../lib/types';
import {
  INITIAL_PROFILE,
  INITIAL_SKILLS,
  INITIAL_PROJECTS,
  INITIAL_EXPERIENCES,
  INITIAL_HEALTH,
} from '../lib/defaults';

export default function HomePage() {
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [experiences, setExperiences] = useState<ExpType[]>(INITIAL_EXPERIENCES);
  const [health, setHealth] = useState<HealthStatus | null>(INITIAL_HEALTH);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, skillsData, projData, expData, healthData] = await Promise.all([
          fetchProfile(),
          fetchSkills(),
          fetchProjects(),
          fetchExperiences(),
          fetchHealth(),
        ]);

        if (profData) setProfile(profData);
        if (skillsData && skillsData.length > 0) setSkills(skillsData);
        if (projData && projData.length > 0) setProjects(projData);
        if (expData && expData.length > 0) setExperiences(expData);
        if (healthData) setHealth(healthData);
      } catch (err) {
        console.warn('Background sync warning:', err);
      }
    }

    loadData();

    // Background health check
    const interval = setInterval(async () => {
      const h = await fetchHealth();
      if (h) setHealth(h);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const isDbConnected = health?.database === 'connected';

  return (
    <>
      <Navbar dbConnected={isDbConnected} />
      <main className="container">
        <Hero profile={profile} />
        <NeonBanner health={health} />
        <Pillars />
        <About profile={profile} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Experience experiences={experiences} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
