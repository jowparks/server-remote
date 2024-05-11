import React, { ReactNode, createContext, useContext, useState } from 'react';
import Airtable from 'airtable';

type FieldSet = Airtable.FieldSet;

interface AirtableContextProps {
  features: FieldSet[][] | undefined;
  fetchFeatures: () => void;
  updateFeatures: (id: string, fields: any) => void;
}

const AirtableContext = createContext<AirtableContextProps | undefined>(
  undefined,
);

export function AirtableProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FieldSet[]>([]);
  const base = new Airtable({
    apiKey:
      'pat0n7V7OLcNUPHgr.09b737a86f41068f6ee9c6bf10468e4a3d7c7caa16765d2197be5387b0b288a0',
  }).base('appPEYjOAp8x8h7Ku');

  const fetchFeatures = () => {
    base
      .table('Feature Requests')
      .select()
      .eachPage(
        (records, fetchNextPage) => {
          const newData = records.map((record) => record.fields);
          console.log(JSON.stringify(newData, null, 2));
          setFeatures([...features, ...newData]);
          fetchNextPage();
        },
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
        },
      );
    console.log(JSON.stringify(features));
  };

  const updateFeatures = (id, fields) => {
    base('Feature Requests').update([{ id, fields }], (err, records) => {
      if (err) {
        console.error(err);
        return;
      }
      fetchFeatures(); // re-fetch data after update
    });
  };

  return (
    <AirtableContext.Provider
      value={{ features, fetchFeatures, updateFeatures }}
    >
      {children}
    </AirtableContext.Provider>
  );
}

export const useAirtable = () => {
  const context = useContext(AirtableContext);
  if (context === undefined) {
    throw new Error('useAirtable must be used within a AirtableProvider');
  }
  return context;
};
