import React, { useEffect, useState } from 'react';
import { View, Text, Card, XStack, Spacer, ScrollView } from 'tamagui';
import { FeatureRequestSchema, useAirtable } from '../../contexts/airtable';
import { ArrowBigUp } from '@tamagui/lucide-icons';
import TransparentButton from '../../components/general/transparent-button';
import { useHeader } from '../../contexts/header';
import FeatureRequestModal from '../../components/feature-request/feature-request-modal';
import Spin from '../../components/general/spinner';
import { RefreshControl } from 'react-native';

export type FeatureRequestProps = {
  onPress: (feature: FeatureRequestSchema) => void;
};

export default function FeatureRequest({ onPress }: FeatureRequestProps) {
  const {
    features,
    votedFeatureIds,
    voteOnFeature,
    unvoteOnFeature,
    fetchFeatures,
    requestFeature,
  } = useAirtable();
  const { featureRequested, setFeatureRequested } = useHeader();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      await fetchFeatures();
      setRefreshing(false);
    })();
  }, [triggerRefresh]);

  const handleVote = (feature: FeatureRequestSchema) => {
    if (votedFeatureIds?.includes(feature.id)) {
      unvoteOnFeature(feature.id);
    } else {
      voteOnFeature(feature.id);
    }
  };

  return features.length == 0 ? (
    <Spin />
  ) : (
    <View flex={1} width={'90%'} alignSelf="center">
      <Spacer size="2%" />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTriggerRefresh(!triggerRefresh);
            }}
          />
        }
      >
        {features.map((feature) => (
          <View key={feature.fields.Name}>
            <Spacer size="$2" />
            <Card
              elevate
              size="$4"
              bordered
              borderRadius={15}
              key={feature.fields.Name}
            >
              <XStack
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <View width="70%">
                  <Card.Header padded style={{ padding: 10 }}>
                    <Text>{feature.fields.Name}</Text>
                  </Card.Header>
                </View>
                <XStack alignItems="center">
                  <Text fontSize={20}>{feature.fields.Votes}</Text>
                  <TransparentButton onPress={() => handleVote(feature)}>
                    <ArrowBigUp
                      {...(votedFeatureIds?.includes(feature.id)
                        ? { fill: 'white' }
                        : {})}
                    />
                  </TransparentButton>
                </XStack>
              </XStack>
            </Card>
          </View>
        ))}
      </ScrollView>
      {featureRequested && (
        <FeatureRequestModal
          open={featureRequested}
          onOpenChange={(open) => setFeatureRequested(open)}
          onConfirm={(featureRequest) => {
            requestFeature(featureRequest);
            setFeatureRequested(false);
          }}
          onCancel={() => setFeatureRequested(false)}
        />
      )}
    </View>
  );
}
