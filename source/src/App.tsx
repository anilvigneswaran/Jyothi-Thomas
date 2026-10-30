import React, { useEffect } from 'react'
import { director, SCENES } from './engine/director'
import { useSectionRegistration } from './engine/hooks'
import { Stage } from './components/Stage'
import { Chrome } from './components/Chrome'
import { Hero, HeroBack } from './scenes/Hero'
import { About, AboutBack } from './scenes/About'
import { Work, WorkBack } from './scenes/Work'
import { Journey, JourneyBack } from './scenes/Journey'
import { Skills, SkillsBack, SkillsFront } from './scenes/Skills'
import { Awards } from './scenes/Awards'
import { Contact, ContactBack } from './scenes/Contact'

const SceneSection: React.FC<{
  id: string
  heightVh: number
  children: React.ReactNode
}> = ({ id, heightVh, children }) => {
  const sectionRef = useSectionRegistration(id)

  return (
    <section
      id={id}
      ref={sectionRef}
      className="scene-section"
      style={{ height: `${heightVh}vh` }}
    >
      <div className="scene-sticky-wrapper">
        <div className="scene-inner">{children}</div>
      </div>
    </section>
  )
}

export const App: React.FC = () => {
  useEffect(() => {
    director.init()
    return () => {
      director.destroy()
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
      {/* z0: Fixed .layer-back containing every scene's behind-the-person elements */}
      <div className="layer-back">
        <HeroBack />
        <AboutBack />
        <WorkBack />
        <JourneyBack />
        <SkillsBack />
        <ContactBack />
      </div>

      {/* z1: Fixed Stage Canvas (Video transparent frames & blade transitions) */}
      <Stage />

      {/* z2: Fixed .layer-front (front half of skills Fibonacci orbit) */}
      <div className="layer-front">
        <SkillsFront />
      </div>

      {/* z3: Main scroll track containing the sticky sections */}
      <main className="scroll-container">
        <SceneSection id="hero" heightVh={SCENES[0].heightVh}>
          <Hero />
        </SceneSection>

        <SceneSection id="about" heightVh={SCENES[1].heightVh}>
          <About />
        </SceneSection>

        <SceneSection id="work" heightVh={SCENES[2].heightVh}>
          <Work />
        </SceneSection>

        <SceneSection id="journey" heightVh={SCENES[3].heightVh}>
          <Journey />
        </SceneSection>

        <SceneSection id="skills" heightVh={SCENES[4].heightVh}>
          <Skills />
        </SceneSection>

        <SceneSection id="awards" heightVh={SCENES[5].heightVh}>
          <Awards />
        </SceneSection>

        <SceneSection id="contact" heightVh={SCENES[6].heightVh}>
          <Contact />
        </SceneSection>
      </main>

      {/* z50 & z90+: Chrome (HUD, cursor, and preloader) */}
      <Chrome />
    </div>
  )
}

export default App
