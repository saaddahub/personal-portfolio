import './ContactButton.css';

const ContactButton = ({ text = "Contacts", href = "#contact", className = "" }) => {
  return (
    <a href={href} className={`contact-btn-wrapper ${className}`}>
      <div className="contact-btn-inner-bg">
        <div className="contact-btn-slider"></div>
        <div className="contact-btn-icon-wrapper">
          <div className="contact-btn-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 16"
              height="100%"
              width="100%"
            >
              <path
                fill="currentColor"
                d="M12.175 9H0V7H12.175L6.575 1.4L8 0L16 8L8 16L6.575 14.6L12.175 9Z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
      <div className="contact-btn-text">
        {text}
      </div>
    </a>
  );
};

export default ContactButton;
