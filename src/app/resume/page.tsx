import PDFEmbed from '../../components/PDFEmbed';

export default function Resume() {
  return (
    <div className="resume-container">
      <h1>Resume</h1>
      
      <div className="resume-pdf-container">
        <h2>Full Resume PDF</h2>
        <PDFEmbed pdfUrl="/resume.pdf" />
      </div>
      <div className="resume-section">
        <h2>Education</h2>
        <div className="resume-item">
          <h3>Ph.D. in Your Field</h3>
          <p className="institution">University Name</p>
          <p className="date">2018-2022</p>
          <p>Dissertation: &quot;Your Dissertation Title&quot;</p>
        </div>
        
        <div className="resume-item">
          <h3>M.S. in Your Field</h3>
          <p className="institution">University Name</p>
          <p className="date">2016-2018</p>
        </div>
      </div>
      
      <div className="resume-section">
        <h2>Research Experience</h2>
        <div className="resume-item">
          <h3>Research Assistant</h3>
          <p className="institution">Laboratory Name, University</p>
          <p className="date">2017-2022</p>
          <p>Description of your research responsibilities and achievements.</p>
        </div>
      </div>
      
      <div className="resume-section">
        <h2>Teaching Experience</h2>
        <div className="resume-item">
          <h3>Teaching Assistant</h3>
          <p className="institution">Course Name, University</p>
          <p className="date">Fall 2019</p>
          <p>Description of your teaching responsibilities.</p>
        </div>
      </div>
      
      <div className="resume-section">
        <h2>Skills</h2>
        <div className="skills-list">
          <span className="skill-tag">Skill 1</span>
          <span className="skill-tag">Skill 2</span>
          <span className="skill-tag">Skill 3</span>
          <span className="skill-tag">Skill 4</span>
          <span className="skill-tag">Skill 5</span>
        </div>
      </div>
    </div>
  );
}