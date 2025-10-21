import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Platform } from "react-native";
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
        tabBarActiveTintColor: "#FF6B6B",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: { marginTop: 12 },
        }),
        headerRight: () => (
          <Button
            onPress={async () => {
              await logout();
              router.replace("/auth/signin");
            }}
            title=""
            variant="text"
            icon={<Ionicons name="log-out-outline" size={70} color={"black"} />}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "PlanCook",
          tabBarIcon: () => (
            <IconSymbol
              size={30}
              name="house.fill"
              color={"black"}
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
              color={"black"}
              weight="bold"
            />
          ),
        }}
      />
    </Tabs>
  );
}
