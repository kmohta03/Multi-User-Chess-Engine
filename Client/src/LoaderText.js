import Center from "./Center";
import MiddelFlexBox from "./MiddleFlexBox";
import HashLoader from "react-spinners/HashLoader";
import { MemoDisplayName } from "./DisplayName";


export default function LoaderText({ text }) {
   return (
       <Center>
           <MiddelFlexBox> <HashLoader /> </MiddelFlexBox>
           <MemoDisplayName>{text}</MemoDisplayName>
       </Center>
   );
}