import React from 'react';
import { Button } from "./button";
import Image from 'next/image';
import { twitterPoints } from '@/app/actions';

interface TwitterButtonProps {
  isDisabled: boolean;
  onFollowSuccess: () => void;
}

const TwitterButton: React.FC<TwitterButtonProps> = ({ isDisabled, onFollowSuccess }) => {
  const handleFollowClick = async () => {
    window.open('https://twitter.com/galaxydoxyz', '_blank');
    const success = await twitterPoints();
    if (success) {
      onFollowSuccess();
    }
  };

  return (
    <Button
      className="text-foreground p-4 text-center rounded-lg font-bold text-sm flex items-center justify-center"
      onClick={handleFollowClick}
      disabled={isDisabled}
      variant={"specialAction"}
    >
      <Image
        src="/images/twitter.png"
        alt="twitter"
        width={24}
        height={24}
        className="mr-2"
      />
      <span>Follow us on Twitter</span>
    </Button>
  );
};

export default TwitterButton;
