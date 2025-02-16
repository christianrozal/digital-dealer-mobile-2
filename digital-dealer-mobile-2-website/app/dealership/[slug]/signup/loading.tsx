import { Spinner } from "@heroui/react";
import AlexiumLogoIcon from '@/app/components/svg/alexiumLogo';

export default function Loading() {
  return (
    <div className="border max-w-sm min-h-screen mx-auto py-12 px-8">
      {/* header */}
      <div className="flex flex-col items-center justify-center">
        <AlexiumLogoIcon size={63} />
        <div className="text-center">
          <div className="h-4 w-32 bg-color3 rounded mt-3 animate-pulse" />
          <div className="h-2 w-24 bg-color3 rounded mt-1 animate-pulse" />
        </div>
      </div>

      {/* body */}
      <div className="mt-16">
        <div>
          <div className="h-8 w-32 bg-color3 rounded animate-pulse" />
          <div className="h-5 w-48 bg-color3 rounded mt-3 animate-pulse" />
          <div className="h-4 w-64 bg-color3 rounded mt-3 animate-pulse" />
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {/* Name Input Skeleton */}
          <div className="h-12 bg-color3 rounded-md px-3 py-1">
            <div className="h-2 w-10 bg-color3 rounded animate-pulse opacity-70" />
          </div>

          {/* Email Input Skeleton */}
          <div className="h-12 bg-color3 rounded-md px-3 py-1">
            <div className="h-2 w-10 bg-color3 rounded animate-pulse opacity-70" />
          </div>

          {/* Phone Input Skeleton */}
          <div className="h-12 bg-color3 rounded-md px-3 py-1">
            <div className="h-2 w-10 bg-color3 rounded animate-pulse opacity-70" />
          </div>

          {/* Checkbox Skeleton */}
          <div className="flex items-center gap-2 mt-2">
            <div className="h-4 w-4 bg-color3 rounded animate-pulse" />
            <div className="h-2 w-48 bg-color3 rounded animate-pulse" />
          </div>

          {/* Button Skeleton */}
          <div className="h-12 bg-color3 rounded-full w-full mt-10 animate-pulse" />
        </div>
      </div>
    </div>
  );
} 