import React from 'react';
import { Tabs, Separator, SizableText, View, TabsContentProps } from 'tamagui';
import { DarkBlueTheme } from '../../style/theme';

export type TabWrapperProps = {
  children: React.ReactNode;
  onTabChange?: (tab: string) => void;
  isEnabled: boolean;
  tabs: string[];
};

function TabWrapper({
  children,
  onTabChange,
  isEnabled,
  tabs,
}: TabWrapperProps) {
  if (!isEnabled) {
    return (
      <View width={'90%'} flexGrow={1} alignSelf="center">
        {children}
      </View>
    );
  }

  return (
    <Tabs
      defaultValue={tabs[0]}
      orientation="horizontal"
      flexDirection="column"
      width={'90%'}
      flexGrow={1}
      alignSelf="center"
      overflow="hidden"
      borderColor="$borderColor"
      onValueChange={onTabChange}
    >
      <Tabs.List
        separator={<Separator vertical />}
        disablePassBorderRadius="bottom"
        aria-label="Search your server"
      >
        {tabs.map((tab, index) => (
          <Tabs.Tab key={index} flex={1} value={tab}>
            <SizableText fontFamily="$body">{tab}</SizableText>
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <Separator />
      {tabs.map((tab, index) => (
        <TabsContent key={index} width={'100%'} value={tab}>
          {children}
        </TabsContent>
      ))}
    </Tabs>
  );
}

const TabsContent = (props: TabsContentProps) => {
  return (
    <Tabs.Content
      backgroundColor={DarkBlueTheme.colors.background}
      key={props.value}
      alignItems="center"
      justifyContent="center"
      flex={1}
      borderColor="$background"
      {...props}
    >
      {props.children}
    </Tabs.Content>
  );
};

export default TabWrapper;
