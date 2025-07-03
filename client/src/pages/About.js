import React from 'react';
import '../stylesheets/AboutPage.css'

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-card">
        <h1 className="about-title">About BookMyFights</h1>

        <p className="about-text">
          I created this as a personal project to solve a problem that I personally experienced.
          I would often miss fights from my favorite fighters because I was busy or simply was not aware they had upcoming fights.

          As a fan of both the UFC and boxing, I wanted to create a simple tool that would keep me updated on my favorite fighters.
          I wanted to quickly know when there was an upcoming fight involving a fighter I enjoyed watching, and that's when I decided to build this app.

          I used this opportunity to sharpen my development skills by combining web scraping with a REST API,
          and front-end development. The app scrapes upcoming fight data, lets you track specific fighters, and integrates with
          Google Calendar so you never miss a fight.

          I've enjoyed developing this app, and have genuinely found it useful myself, and I hope you will too!
        </p>

      </div>
    </div>
  );
};

export default AboutPage;
