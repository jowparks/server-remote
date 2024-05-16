import React, { useState } from 'react';
import { View, Text, Button, RadioGroup, YStack, Slider, Sheet } from 'tamagui';
import { RadioGroupItemWithLabel } from '../../../components/general/radio';
import { CheckboxWithLabel } from '../../../components/general/checkbox-labeled';
import { DarkBlueTheme } from '../../../style/theme';
import LabeledInput from '../../../components/general/labeled-input';
import { FileInfo } from '../../../util/files/util';

export enum CompressionFormats {
  Zip = '.zip',
  Tar = '.tar',
  TarGz = '.tar.gz',
  TarBz2 = '.tar.bz2',
}

export type CompressModalProps = {
  open: boolean;
  file: FileInfo | null;
  onOpenChange: (open: boolean) => void;
};

export default function CompressModal({
  open,
  file,
  onOpenChange,
}: CompressModalProps) {
  const defaultCompressionFormat = CompressionFormats.Zip;
  const [compressionLevel, setCompressionLevel] = useState(6);
  const [compressionFormat, setCompressionFormat] = useState(
    defaultCompressionFormat,
  );
  const [includeSubdirectories, setIncludeSubdirectories] = useState(true);
  const [preservePermissions, setPreservePermissions] = useState(true);
  const [excludePattern, setExcludePattern] = useState('');
  const [outputName, setOutputName] = useState(
    file ? file.fileName + defaultCompressionFormat : '',
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCompress = () => {
    let command = '';

    switch (compressionFormat) {
      case CompressionFormats.Zip:
        command = 'zip';
        if (compressionLevel) {
          command += ` -${compressionLevel}`;
        }
        if (includeSubdirectories) {
          command += ' -r';
        }
        if (excludePattern) {
          command += ` -x ${excludePattern}`;
        }
        command += ` ${outputName}`;
        console.log(command);
        return;
      case CompressionFormats.TarBz2:
        command = 'tar -I pbzip2';
        if (compressionLevel) {
          command += ` -${compressionLevel}`;
        }
        break;
      case CompressionFormats.Tar:
        command = 'tar -c';
        break;
      case CompressionFormats.TarGz:
        command = 'tar -z';
        if (compressionLevel) {
          command += ` -${compressionLevel}`;
        }
        break;
      default:
        throw new Error(`Unsupported compression format: ${compressionFormat}`);
    }

    if (includeSubdirectories) {
      command += ' -r';
    }

    if (preservePermissions) {
      command += ' -p';
    }

    if (excludePattern) {
      command += ` --exclude=${excludePattern}`;
    }

    command += ` -cvf ${outputName}${compressionFormat}`;
    console.log(command);
  };

  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={true}
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[95, 50]}
      snapPointsMode={'percent'}
      dismissOnSnapToBottom
      // animation="medium"
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle backgroundColor={DarkBlueTheme.colors.notification} />
      <Sheet.Frame>
        <View
          justifyContent="center"
          padding="$4"
          space="$5"
          alignItems="center"
        >
          <LabeledInput
            label="Output File Name"
            value={outputName}
            onChangeText={setOutputName}
            style={{ marginBottom: 10 }}
          />
          <RadioGroup
            aria-labelledby="Select one item"
            defaultValue={CompressionFormats.Zip}
            name="form"
            onValueChange={(value) =>
              setCompressionFormat(value as CompressionFormats)
            }
            style={{ marginBottom: 10 }}
          >
            <YStack width={300} alignItems="center" space="$2">
              {Object.values(CompressionFormats).map((format, index) => (
                <RadioGroupItemWithLabel
                  key={index}
                  size="$3"
                  value={format}
                  label={format}
                />
              ))}
            </YStack>
          </RadioGroup>
          <Button
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={{ marginBottom: 10, width: '90%' }}
          >
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </Button>
          {showAdvanced && (
            <>
              <Text style={{ marginBottom: 10 }}>Compression Level (1-9)</Text>
              <Slider
                defaultValue={[6]}
                max={9}
                min={1}
                step={1}
                onValueChange={(values) => setCompressionLevel(values[0])}
                style={{ marginBottom: 10 }}
              >
                <Slider.Track>
                  <Slider.TrackActive />
                </Slider.Track>
                <Slider.Thumb circular index={0} />
              </Slider>
              <CheckboxWithLabel
                size="$3"
                checked={includeSubdirectories}
                onCheckedChange={() =>
                  setIncludeSubdirectories(!includeSubdirectories)
                }
                label="Include Subdirectories"
                style={{ marginBottom: 10 }}
              />
              <CheckboxWithLabel
                size="$3"
                defaultChecked={preservePermissions}
                onCheckedChange={() =>
                  setPreservePermissions(!preservePermissions)
                }
                label="Preserve Permissions"
                style={{ marginBottom: 10 }}
              />
              <LabeledInput
                label="Exclude Pattern"
                value={excludePattern}
                onChangeText={setExcludePattern}
                style={{ marginBottom: 10 }}
              />
            </>
          )}
          <Button onPress={handleCompress}> Compress </Button>
        </View>
      </Sheet.Frame>
    </Sheet>
  );
}
