# First Scene Setup

Create `LumoHome`.

Lumo prefab components: Animator, NavMeshAgent, LumoAnimatorBridge, LumoNeeds, LumoInventory, LumoController.

Animator: Float `Speed`; triggers `Eat`, `Sleep`, `Dance`, `Dress`, `Guitar`, `Pet`, `Build`.

World anchors: bedroom/bed/Sleep; kitchen/pizza/Eat; living room/dance_spot/Dance; living room/guitar_spot/PlayGuitar; wardrobe/wardrobe/Dress; yard/dog/PetAnimal; yard/car/EnterCar; home_entry, city_entry, beach_entry, mountain_entry/Move.

Bake NavMesh. Add GameSystems with WorldRegistry, CommandExecutor, IdleLifeBrain, GameStatePersistence, optional LumoCommandApiClient. Add ThirdPersonLumoCamera to Main Camera.
