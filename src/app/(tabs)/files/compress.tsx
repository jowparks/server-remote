import React, { useState } from 'react';
import { View, Text, Input, Button, RadioGroup, YStack, Slider } from 'tamagui';
import { RadioGroupItemWithLabel } from '../../../components/radio';
import { CheckboxWithLabel } from '../../../components/checkbox-labeled';

export enum CompressionFormats {
  Tar = '.tar',
  TarGz = '.tar.gz',
  TarBz2 = '.tar.bz2',
  Zip = '.zip',
}

export default function CompressModal() {
  const [compressionLevel, setCompressionLevel] = useState(6);
  const [compressionFormat, setCompressionFormat] = useState(
    CompressionFormats.TarGz,
  );
  const [includeSubdirectories, setIncludeSubdirectories] = useState(true);
  const [preservePermissions, setPreservePermissions] = useState(true);
  const [excludePattern, setExcludePattern] = useState('');
  const [outputName, setOutputName] = useState('compressed');
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
    <View style={{ marginTop: 22 }}>
      <View>
        <Text>Compress File</Text>
        <Input
          placeholder="Output Name"
          value={outputName}
          onChangeText={setOutputName}
        />
        <RadioGroup
          aria-labelledby="Select one item"
          defaultValue={CompressionFormats.TarGz}
          name="form"
          onValueChange={(value) =>
            setCompressionFormat(value as CompressionFormats)
          }
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
        <Button onPress={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </Button>
        {showAdvanced && (
          <>
            <Text>Compression Level (1-9)</Text>
            <Slider
              defaultValue={[6]}
              max={9}
              min={1}
              step={1}
              onValueChange={(values) => setCompressionLevel(values[0])}
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
            />
            <CheckboxWithLabel
              size="$3"
              defaultChecked={preservePermissions}
              onCheckedChange={() =>
                setPreservePermissions(!preservePermissions)
              }
              label="Preserve Permissions"
            />
            <Input
              placeholder="Exclude Pattern"
              value={excludePattern}
              onChangeText={setExcludePattern}
            />
          </>
        )}
        <Button onPress={handleCompress}> Compress </Button>
      </View>
    </View>
  );
}
