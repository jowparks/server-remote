export type SubscreenType =
  | CommandType
  | SearchScreenType
  | SearchListScreenType;

export type GenericScreenType =
  | SearchListScreenType
  | SearchScreenType
  | ScrollCardScreenType;

export const Screens = ['searchList', 'menu', 'scrollCard'];

export const Displays = ['button', 'command', 'text', 'image'];

export type DisplayTypes = ButtonType | ImageType | TextType | CommandType;

export type JsonString = string;

export const SearchReplace = '{{ searchreplace }}';

export type CommandType = {
  type: 'command';
  command: string;
};

export type ButtonType = {
  type: 'button';
  icon: string;
  iconPressed: string;
  buttonCommand: string;
  buttonResponse: string;
};

export type TextType = {
  type: 'text';
  text: string;
  size: number;
};

export type ImageType = {
  type: 'image';
  imageSource: string;
};

export type SearchListScreenType = {
  // standard strings will be kept as is, SearchReplace will be replaced with search string
  jsonData: GenericScreenType;
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
};

export type ScrollCardScreenType = {
  jsonData: Object;
  currentPath: string;
  type: 'scrollCard';
  title: string;
  displayItems: DisplayTypes[];
};

export type SearchScreenType = {
  jsonData: Object;
  currentPath: string;
  type: 'menu';
  command: string;
  name: string;
  subHeading: string;
};
