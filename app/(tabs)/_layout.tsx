import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Image, Platform } from "react-native";
import { HapticTab } from "../../components/HapticTab";
import { Button } from "../../components/ui/Button";
import { IconSymbol } from "../../components/ui/IconSymbol";
import TabBarBackground from "../../components/ui/TabBarBackground";
import { useAuth } from "../../contexts/AuthContext";

export default function TabLayout() {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#556942",
        headerShown: true,
        tabBarButton: HapticTab,
        headerStyle: {
          backgroundColor: "#F8F6EE",
        },
        headerTintColor: "#556942",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: { marginTop: 12 },
        }),
        headerLeft: () => (
          <Image
            source={require("../../assets/images/icon.png")}
            style={{ width: 60, height: 60, marginLeft: 12 }}
          />
        ),
        headerRight: () => (
          <Button
            onPress={async () => {
              await logout();
              router.replace("/auth/signin");
            }}
            title=""
            variant="text"
            icon={<Ionicons name="log-out-outline" size={28} color="#556942" />}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "PlanCook",
          tabBarStyle: {
            backgroundColor: "#F8F6EE",
          },
          tabBarIcon: () => (
            <IconSymbol
              size={30}
              name="house.fill"
              color="#556942"
              weight="bold"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recettes",
          tabBarIcon: () => (
            <IconSymbol
              size={30}
              name="fork.knife"
              color="#556942"
              weight="bold"
            />
          ),
        }}
      />
    </Tabs>
  );
}
