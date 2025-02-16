import { Spinner } from "@heroui/react";
import AlexiumLogoIcon from '@/app/components/svg/alexiumLogo';

export default function Loading() {
  return (
    <div className="border max-w-sm min-h-screen mx-auto py-12 px-8">
      <div className="flex flex-col items-center justify-center h-full">
        <AlexiumLogoIcon size={63} />
        <div className="text-center">
          <h1 className="text-xs font-semibold mt-3 text-black">
            Loading...
          </h1>
          <p className="text-color2 text-[8px]">POWERED BY ALEXIUM</p>
        </div>
        <div className="mt-10">
          <Spinner size="lg" color="primary"/>
        </div>
      </div>
    </div>
  );
} 