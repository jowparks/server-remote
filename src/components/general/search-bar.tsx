import React from 'react';
import { Input, Spacer } from 'tamagui';

export type SearchBarProps = {
  searchInput: string;
  handleSearch: (text: string) => void;
  visible: boolean;
};

export default function SearchBar({ searchInput, handleSearch, visible }) {
  return !visible ? (
    <></>
  ) : (
    <>
      <Spacer size="$2" />
      <Input
        width="90%"
        alignSelf="center"
        placeholder="Search"
        value={searchInput}
        onChangeText={handleSearch}
        autoCapitalize="none"
      />
      <Spacer size="$2" />
    </>
  );
}
