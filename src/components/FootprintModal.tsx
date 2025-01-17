import { SearchIcon, PhoneIcon } from "@chakra-ui/icons";
import {
  Center,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import { calculateEmissions } from "ethereum-emissions-calculator";
import { useCallback, useState } from "react";
import useFetchENS from "../hooks/useFetchENS";
import useEmissionsStore from "../store/useEmissionsStore";

const FootprintModal = () => {
  const { emissions, setEmissions } = useEmissionsStore();
  const [nameEntry, setNameEntry] = useState<string | undefined>(undefined);

  const { ens } = useFetchENS(nameEntry);
  console.log("ens", ens);
  const fetchEmissions = useCallback(async () => {
    if (!ens || !nameEntry) return;
    await calculateEmissions({
      address: ens ?? nameEntry,
      etherscanAPIKey: "P2KWECEJGIRTHCINS7UWITA8THH1GKA4YW",
    })
      .then((res) => {
        setEmissions({ ...res, tCO2: res.kgCO2 / 1000, wallet: nameEntry ?? "" });
      })
      .catch((err) => console.log("Houston we have a problem", err));
  }, [nameEntry, setEmissions, ens]);

  return (
    <Flex
      flexDirection={"column"}
      color="white"
      m="0 auto"
      maxWidth="85%"
      bgColor="gray.800"
      opacity={0.9}
      borderRadius={"xl"}
    >
      <Heading py={2} fontSize="2xl">
        Measure your onchain footprint
      </Heading>
      <InputGroup pb={6}>
        <InputLeftElement pointerEvents="none">
          <PhoneIcon color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Enter a wallet address or ENS name"
          onChange={(e) => {
            e.preventDefault();
            setNameEntry(e.target.value);
          }}
        />
        <InputRightElement
          as="button"
          bg="gray.200"
          borderRadius={"lg"}
          onClick={(e) => {
            fetchEmissions();
          }}
        >
          <SearchIcon color="green.500" />
        </InputRightElement>
      </InputGroup>
      {emissions.done && (
        <>
          <Center flex="1" flexDirection={"column"}>
            <Heading color="red.300">{emissions?.kgCO2 / 1000} Tons of CO2</Heading>
            <Text py={6} fontSize="lg">
              This address initiated{" "}
              <Text as="span" fontWeight={"bold"}>
                {emissions?.transactionsCount} transactions
              </Text>{" "}
              consuming{" "}
              <Text as="span" fontWeight={"bold"}>
                {emissions?.gasUsed} gas
              </Text>
              . In total, this address is responsible for {emissions?.kgCO2} kilograms (
              {emissions?.kgCO2 / 1000} tons) of CO₂ emissions.
            </Text>
          </Center>
        </>
      )}
    </Flex>
  );
};

export default FootprintModal;
