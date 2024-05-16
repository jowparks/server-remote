import React, { useEffect } from 'react';
import Splash from './splash';
import { useAirtable } from '../../contexts/airtable';

export default function UpdateRequired() {
  const { checkUpdateRequired, updateRequired } = useAirtable();
  useEffect(() => {
    checkUpdateRequired();
  }, []);
  if (updateRequired) {
    // TODO add link to app store
    return <Splash text="UPDATE REQUIRED" />;
  }
  return <></>;
}
