import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import type { LoadingState } from 'web-check-live/components/misc/ProgressBar';
import type { AddressType } from 'web-check-live/utils/address-type-checker';
import keys from 'web-check-live/utils/get-keys';

interface UseIpAddressProps<ResultType = any> {
  // Unique identifier for this job type
  jobId: string | string[];
  // The actual fetch request
  fetchRequest: () => Promise<ResultType>;
  // Function to call to update the loading state in parent
  updateLoadingJobs: (job: string | string[], newState: LoadingState, error?: string, retry?: (data?: any) => void | null, data?: any) => void;
  addressInfo: {
    // The hostname/ip address that we're checking
    address: string | undefined;
    // The type of address (e.g. url, ipv4)
    addressType: AddressType;
    // The valid address types for this job
    expectedAddressTypes: AddressType[];
  };
}

interface UseCheckWithHistoryProps {
  address: string | undefined;
  addressType: AddressType;
  updateLoadingJobs: (job: string | string[], newState: LoadingState, error?: string, retry?: (data?: any) => void | null, data?: any) => void;
}

type ResultType = any;

type ReturnType = [ResultType | undefined, (data?: any) => void];

const useMotherOfAllHooks = <ResultType = any>(params: UseIpAddressProps<ResultType>): ReturnType => {
  // Destructure params
  const { addressInfo, fetchRequest, jobId, updateLoadingJobs } = params;
  const { address, addressType, expectedAddressTypes } = addressInfo;

  // Build useState that will be returned
  const [result, setResult] = useState<ResultType>();

  // Fire off the HTTP fetch request, then set results and update loading / error state

  const doTheFetch = () => {
    if (keys.disableEverything) {
      updateLoadingJobs(jobId, 'skipped', 'Web-Check is temporarily disabled. Please try again later.', reset);
      return Promise.resolve();
    }
    return fetchRequest()
    .then((res: any) => {
      if (!res) { // No response :(
        updateLoadingJobs(jobId, 'error', 'No response', reset);
      } else if (res.error) { // Response returned an error message
        if (res.error.includes("timed-out")) { // Specific handling for timeout errors
          updateLoadingJobs(jobId, 'timed-out', res.error, reset);
        } else {
          updateLoadingJobs(jobId, 'error', res.error, reset);
        }
      } else if (res.errorType && res.errorMessage) {
        const errorMessage = `${res.errorType}\n${res.errorMessage}\n\n`
        + `This sometimes occurs on Netlify if using the free plan. You may need to upgrade to use lambda functions`;
        updateLoadingJobs(jobId, 'error', errorMessage, reset);
      } else if (res.skipped) { // Response returned a skipped message
        updateLoadingJobs(jobId, 'skipped', res.skipped, reset);
      } else { // Yay, everything went to plan :)
        setResult(res);
        updateLoadingJobs(jobId, 'success', '', undefined, res);
      }
    })
    .catch((err) => {
      // Something fucked up
      updateLoadingJobs(jobId, 'error', err.error || err.message || 'Unknown error', reset);
      throw err;
    })
  }

  // For when the user manually re-triggers the job
  const reset = (data: any) => {
    // If data is provided, then update state
    if (data && !(data instanceof Event) && !data?._reactName) {
      setResult(data);
    } else { // Otherwise, trigger a data re-fetch
      updateLoadingJobs(jobId, 'loading');
      const fetchyFetch = doTheFetch();
      const toastOptions = {
        pending: `Updating Data (${jobId})`,
        success: `Completed (${jobId})`,
        error: `Failed to update (${jobId})`,
        skipped: `Skipped job (${jobId}), as no valid results for host`,
      };
      // Initiate fetch, and show progress toast
      toast.promise(fetchyFetch, toastOptions).catch(() => {});
    }
  };

  useEffect(() => {
    // Still waiting for this upstream, cancel job
    if (!address || !addressType) {
      return;
    }
    // This job isn't needed for this address type, cancel job
    if (!expectedAddressTypes.includes(addressType)) {
      if (addressType !== 'empt') updateLoadingJobs(jobId, 'skipped');
      return;
    }

    // Initiate the data fetching process
    doTheFetch().catch(() => {});
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, addressType]);

  return [result, reset];
};

// New hook for check-with-history endpoint
export const useCheckWithHistory = (params: UseCheckWithHistoryProps): [any | undefined, (data?: any) => void] => {
  const { address, addressType, updateLoadingJobs } = params;
  const [result, setResult] = useState<any>();

  const doTheFetch = () => {
    if (keys.disableEverything) {
      updateLoadingJobs('check-with-history', 'skipped', 'Web-Check is temporarily disabled. Please try again later.', reset);
      return Promise.resolve();
    }

    const api = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';
    
    return fetch(`${api}/check-with-history?url=${encodeURIComponent(address || '')}`)
    .then((res) => res.json())
    .then((res: any) => {
      if (!res) {
        updateLoadingJobs('check-with-history', 'error', 'No response', reset);
      } else if (res.error) {
        updateLoadingJobs('check-with-history', 'error', res.error, reset);
      } else {
        setResult(res);
        updateLoadingJobs('check-with-history', 'success', '', undefined, res);
        
        // If this was a cached result, show a toast
        if (res.cached) {
          toast.info(`Using cached analysis from ${res.cache_age_minutes} minutes ago`);
        }
      }
    })
    .catch((err) => {
      updateLoadingJobs('check-with-history', 'error', err.error || err.message || 'Unknown error', reset);
      throw err;
    });
  };

  const reset = (data: any) => {
    if (data && !(data instanceof Event) && !data?._reactName) {
      setResult(data);
    } else {
      updateLoadingJobs('check-with-history', 'loading');
      const fetchyFetch = doTheFetch();
      const toastOptions = {
        pending: 'Updating Analysis',
        success: 'Analysis Completed',
        error: 'Failed to update analysis',
        skipped: 'Skipped analysis',
      };
      toast.promise(fetchyFetch, toastOptions).catch(() => {});
    }
  };

  useEffect(() => {
    if (!address || !addressType || addressType === 'empt') {
      return;
    }

    doTheFetch().catch(() => {});
  }, [address, addressType]);

  return [result, reset];
};

export default useMotherOfAllHooks;

// I really fucking hate TypeScript sometimes....
// Feels like a weak attempt at trying to make JavaScript less crappy,
// when the real solution would be to just switch to a proper, typed, safe language
// ... Either that, or I'm just really shit at it.
