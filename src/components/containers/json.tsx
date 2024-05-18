import React, { useState, ReactNode, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View, ScrollView } from 'tamagui';
import { DarkBlueTheme } from '../../style/theme';
import { useHeader } from '../../contexts/header';

type JsonNodeProps = {
  name: string;
  data: any;
  level?: number;
  renderKey?: (key: string) => ReactNode;
  renderValue?: (value: any) => ReactNode;
  renderArrayLabel?: (label: string) => ReactNode;
};

const JsonNode: React.FC<JsonNodeProps> = ({
  name,
  data,
  level = 0,
  renderKey,
  renderValue,
  renderArrayLabel,
}) => {
  const { detailsExpanded } = useHeader();
  const [isOpen, setIsOpen] = useState(false);
  const handlePress = () => setIsOpen(!isOpen);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  useEffect(() => {
    setIsOpen(detailsExpanded);
  }, [detailsExpanded]);

  // TODO: wrapping of VM text looks funny
  const WrapperComponent = isObject || isArray ? TouchableOpacity : View;
  const wrapperProps = isObject || isArray ? { onPress: handlePress } : {};
  return (
    <View>
      <WrapperComponent
        {...wrapperProps}
        style={{
          flexDirection: 'row',
          paddingLeft: level * 10,
        }}
      >
        {(isObject || isArray) && <Triangle isOpen={isOpen} />}
        <Content content={name + ': '} renderer={renderKey} />
        {isArray ? (
          <Content
            content={`[${data.length} items]`}
            renderer={renderArrayLabel}
          />
        ) : !isObject ? (
          <Content content={data} renderer={renderValue} />
        ) : null}
      </WrapperComponent>
      {isOpen &&
        (isObject ? (
          Object.keys(data)
            .sort()
            .map((key) => (
              <JsonNode
                key={key}
                name={key}
                data={data[key]}
                level={level + 1}
                renderKey={renderKey}
                renderValue={renderValue}
              />
            ))
        ) : isArray ? (
          data.map((item, index) => (
            <JsonNode
              key={index}
              name={index.toString()}
              data={item}
              level={level + 1}
              renderKey={renderKey}
              renderValue={renderValue}
            />
          ))
        ) : (
          <Content content={data} renderer={renderValue} />
        ))}
    </View>
  );
};

type ContentProps = {
  content: string;
  renderer?: (key: any) => ReactNode;
};

const Content: React.FC<ContentProps> = ({ content, renderer }) => {
  return renderer ? (
    renderer(content)
  ) : (
    <Text style={{ color: 'white' }} selectable>
      {content}
    </Text>
  );
};

const Triangle = ({ isOpen }: { isOpen: boolean }) => (
  <Text
    style={{
      transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
      color: 'lightblue',
    }}
  >
    ▶
  </Text>
);

type JsonViewerProps = {
  data: any;
  renderKey?: (key: string) => ReactNode;
  renderValue?: (value: any) => ReactNode;
  renderArrayLabel?: (label: string) => ReactNode;
};

const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  renderKey,
  renderValue,
  renderArrayLabel,
}) => {
  return (
    <ScrollView>
      {Object.keys(data)
        .filter((key) => !!key)
        .sort()
        .map((key) => (
          <JsonNode
            key={key}
            name={key}
            data={data[key]}
            renderKey={renderKey}
            renderValue={renderValue}
            renderArrayLabel={renderArrayLabel}
          />
        ))}
    </ScrollView>
  );
};

export default JsonViewer;
