export type GenericScreenType = SearchListType | MenuType;

export const SearchReplace = '@searchreplace@';
export type SearchCardType = {
  name: string;
  subHeading: string;
};

export type SearchListType = {
  // standard strings will be kept as is, searchreplace will be replaced with search string
  type: 'searchList';
  searchCommand: string;
  name: string;
  subHeading: string;
  onCardPress: string;
  id?: string;
  subPages?: Map<string, GenericScreenType>;
};

export type MenuType = {
  type: 'menu';
  command: string;
  name: string;
  subHeading: string;
};
