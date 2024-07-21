export type SubscreenType = string | SearchScreenType | SearchListScreenType;

export type GenericScreenType = SearchListScreenType | SearchScreenType;

export type JsonString = string;

export const SearchReplace = '{{ searchreplace }}';

export type ButtonType = {
  jsonData: Object;
  currentPath: string;
  type: 'button';
  icon: string;
  iconPressed: string;
  buttonCommand: string;
  buttonResponse: string;
};

export type SearchListScreenType = {
  // standard strings will be kept as is, SearchReplace will be replaced with search string
  jsonData: Object;
  currentPath: string;
  type: 'searchList';
  title: string;
  searchCommand: string;
  onCardPress: SubscreenType;
  nameField: string;
  subHeadingField: string;
  searchResponse?: string;
  onCardPressResponse?: string;
  idField?: string;
  buttons?: ButtonType[];
};

export type ScrollCardScreenType = {
  jsonData: Object;
  currentPath: string;
  type: 'scrollCard';
  title: string;
  searchCommand: string;
  onCardPress: SubscreenType;
  nameField: string;
  subHeadingField: string;
  searchResponse?: string;
  onCardPressResponse?: string;
  idField?: string;
  buttons?: ButtonType[];
};

export type SearchScreenType = {
  jsonData: Object;
  currentPath: string;
  type: 'menu';
  command: string;
  name: string;
  subHeading: string;
};
