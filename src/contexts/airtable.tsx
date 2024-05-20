import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import Airtable from 'airtable';
import { storage } from '../storage/mmkv';
import semver from 'semver';
import packageJson from '../../package.json';

export interface FeatureRequestSchema {
  _table: {
    _base: {
      _airtable: Record<string, unknown>;
      _id: string;
    };
    id: null;
    name: string;
  };
  id: string;
  _rawJson: {
    id: string;
    createdTime: string;
    fields: {
      Name: string;
      Status: string;
      Votes: number;
      Priority: string;
      'Start date': string;
    };
  };
  fields: {
    Name: string;
    Status: string;
    Votes: number;
    Priority: string;
    'Start date': string;
  };
}

interface AirtableContextProps {
  features: FeatureRequestSchema[];
  votedFeatureIds: string[] | undefined;
  fetchFeatures: () => Promise<FeatureRequestSchema[]>;
  voteOnFeature: (id: string) => void;
  unvoteOnFeature: (id: string) => void;
  requestFeature: (name: string) => void;
  updateRequired: boolean | null;
  checkUpdateRequired: () => Promise<void>;
}

const AirtableContext = createContext<AirtableContextProps | undefined>(
  undefined,
);

export function AirtableProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeatureRequestSchema[]>([]);
  const [votedFeatureIds, setVotedFeatureIds] = useState<string[]>([]);
  const [updateRequired, setUpdateRequired] = useState<boolean | null>(null);

  const votedFeatureIdsStore = 'votedFeatureIds_arr'; // key for the local storage

  useEffect(() => {
    const loadedVotedFeatureIds = storage.get<string[]>(votedFeatureIdsStore);
    if (loadedVotedFeatureIds) {
      setVotedFeatureIds(loadedVotedFeatureIds);
    }
  }, []);

  const base = new Airtable({
    apiKey:
      'pat0n7V7OLcNUPHgr.09b737a86f41068f6ee9c6bf10468e4a3d7c7caa16765d2197be5387b0b288a0',
  }).base('appPEYjOAp8x8h7Ku');

  const fetchFeatures = (): Promise<FeatureRequestSchema[]> => {
    return new Promise((resolve, reject) => {
      const allFeatures: FeatureRequestSchema[] = [];

      base
        .table('Feature Requests')
        .select()
        .eachPage(
          (records, fetchNextPage) => {
            const response = records as unknown as FeatureRequestSchema[];
            const prevFeatures = allFeatures.filter(
              (typedRecord) =>
                !response.some(
                  (feature) => feature.fields.Name === typedRecord.fields.Name,
                ),
            );
            allFeatures.push(
              ...prevFeatures,
              ...response.sort((a, b) => b.fields.Votes - a.fields.Votes),
            );
            fetchNextPage();
          },
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(allFeatures);
            setFeatures(allFeatures);
          },
        );
    });
  };

  const voteOnFeature = (id: string) => {
    const newVotedFeatureIds = [...votedFeatureIds, id];
    setVotedFeatureIds(newVotedFeatureIds);
    storage.setObject(votedFeatureIdsStore, newVotedFeatureIds);
    const feature = features.find((f) => f.id === id);
    if (!feature) {
      return;
    }
    const newVotes = feature.fields.Votes + 1;
    updateFeatures(id, { Votes: newVotes });
  };

  const unvoteOnFeature = (id: string) => {
    const newVotedFeatureIds = votedFeatureIds.filter(
      (votedId) => votedId !== id,
    );
    setVotedFeatureIds(newVotedFeatureIds);
    storage.setObject(votedFeatureIdsStore, newVotedFeatureIds);
    const feature = features.find((f) => f.id === id);
    if (!feature) {
      return;
    }
    const newVotes = feature.fields.Votes - 1;
    updateFeatures(id, { Votes: newVotes });
  };

  const updateFeatures = (id: string, fields: Record<string, any>) => {
    base.table('Feature Requests').update([{ id, fields }], (err, records) => {
      if (err) {
        console.error(err);
        return;
      }
      fetchFeatures(); // re-fetch data after update
    });
  };

  const requestFeature = (name: string) => {
    base.table('Feature Requests').create(
      [
        {
          fields: {
            Name: name,
            Status: 'To do',
            Votes: 1,
            Priority: 'Low',
          },
        },
      ],
      (err, records) => {
        if (err) {
          console.error(err);
          return;
        }
        if (!records) {
          return;
        }
        const newVotedFeatureIds = [...votedFeatureIds, records[0].id];
        setVotedFeatureIds(newVotedFeatureIds);
        storage.setObject(votedFeatureIdsStore, newVotedFeatureIds);
        fetchFeatures(); // re-fetch data after create
      },
    );
  };

  const checkUpdateRequired = async () => {
    const rawVersion = packageJson.version;
    const currentVersion = rawVersion.split('-')[0]; // Remove any build metadata or pre-release suffix

    const rows = await base.table('UpdateVersion').select().all();
    const minVersion = rows[0].fields.Version;
    if (semver.lt(currentVersion, minVersion)) {
      setUpdateRequired(true);
    }
  };

  return (
    <AirtableContext.Provider
      value={{
        features,
        votedFeatureIds,
        fetchFeatures,
        voteOnFeature,
        unvoteOnFeature,
        requestFeature,
        updateRequired,
        checkUpdateRequired,
      }}
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
