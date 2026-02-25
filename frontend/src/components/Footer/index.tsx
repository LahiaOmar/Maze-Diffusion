import { DiGithubBadge } from 'react-icons/di';
import { RiTwitterXFill } from 'react-icons/ri';

const Footer = () => {
  return (
    <div className="flex flex-col justify-center items-center space-y-2 py-2 shrink-0">
      <span className="text-sm sm:text-base text-center">Built with Love-ffusion ❤️ 🌀</span>
      <div className="flex space-x-1">
        <a
          href="https://github.com/LahiaOmar/Maze-Diffusion"
          className="hover:text-blue-500"
          target="_blank"
          rel="noopener noreferrer"
        >
          <DiGithubBadge className="w-8 h-8" />
        </a>
        <a
          href="https://twitter.com/df_trainX"
          className="hover:text-blue-500"
          target="_blank"
          rel="noopener noreferrer"
        >
          <RiTwitterXFill className="w-8 h-8" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
