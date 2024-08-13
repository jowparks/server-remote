export type SubscreenType =
  | CommandType
  | SearchScreenType
  | SearchListScreenType;

export type GenericScreenType = (
  | SearchListScreenType
  | SearchScreenType
  | ScrollCardScreenType
) &
  ScreenMetadata;

export const Screens = ['searchList', 'menu', 'scrollCard'];

export const Displays = ['button', 'command', 'text', 'image'];

export type DisplayTypes =
  | GenericScreenType
  | ButtonType
  | ImageType
  | TextType
  | CommandType;

export type JsonString = string;

export const SearchReplace = '{{ searchreplace }}';

export type CommandType = {
  type: 'command';
  command: string;
};

export type ButtonType = {
  type: 'button';
  onPress: DisplayTypes;
  buttonResponse?: string;
  text?: string;
  icon?: string;
};

export type TextType = {
  type: 'text';
  text: string;
  size?: number;
  align?: 'center' | 'left' | 'right' | 'justify' | 'auto';
};

export type ImageType = {
  type: 'image';
  imageSource: string;
  width?: number;
  height?: number;
};

export type SearchListScreenType = {
  // standard strings will be kept as is, SearchReplace will be replaced with search string
  type: 'searchList';
  jsonData: GenericScreenType;
  eventData?: Object;
  currentPath?: string;
  name: string;
  searchCommand: string;
  card: SearchCardType;
  searchResponse?: string;
  onCardPress: DisplayTypes;
  onCardPressResponse?: string;
};

export type SearchCardType = {
  type: 'searchCard';
  nameField: string;
  subHeadingField: string;
  idField?: string;
};

export type ScrollCardScreenType = {
  type: 'scrollCard';
  jsonData: GenericScreenType;
  eventData?: Object;
  currentPath: string;
  title: string;
  name: string;
  displayItems: DisplayTypes[];
};

export type SearchScreenType = {
  type: 'menu';
  jsonData: Object;
  currentPath: string;
  command: string;
  name: string;
  subHeading: string;
};

export type ScreenMetadata = {
  icon: string;
};

export type Config = {
  tabs?: {
    [key: string]: GenericScreenType;
  };
};
