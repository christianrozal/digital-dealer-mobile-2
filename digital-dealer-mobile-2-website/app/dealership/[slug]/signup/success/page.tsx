'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Thank You{name ? `, ${name}` : ''}!</h2>
          <p className="mt-2 text-gray-600">
            Your information has been successfully submitted. A representative will be in touch with you shortly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage; 