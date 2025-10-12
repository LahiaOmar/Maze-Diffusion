import { DiGithubBadge } from 'react-icons/di';
import { RiTwitterXFill } from 'react-icons/ri';

const Footer = () => {
  return (
    <footer className="flex flex-col justify-center items-center space-y-2" role="contentinfo">
      <p className="text-sm text-gray-600">
        Built with Love-ffusion ❤️ 🌀
      </p>
      <nav className="flex space-x-1" aria-label="Social media links">
        <a
          href="https://github.com/LahiaOmar/Maze-Diffusion"
          className="hover:text-blue-500 transition-colors duration-200"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit our GitHub repository"
        >
          <DiGithubBadge className="w-8 h-8" aria-hidden="true" />
        </a>
        <a
          href="https://twitter.com/df_trainX"
          className="hover:text-blue-500 transition-colors duration-200"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Twitter/X"
        >
          <RiTwitterXFill className="w-8 h-8" aria-hidden="true" />
        </a>
      </nav>
    </footer>
  );
};

export default Footer;
