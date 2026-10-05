using System;
using System.Collections.Generic;
using UnityEngine;

namespace ScooterMayhem.City
{
    /// <summary>
    /// Procedural Taiwanese City Generator for Unity 6 (84m Urban Grid & Back-Alleys)
    /// Generates:
    /// 1. Main Avenue (南北向主幹道, Z from -170 to +170, X = 0)
    /// 2. Three Cross Streets (東西向橫向大道: 北門路, 中正路, 逢甲路 at Z = -90, 0, 90)
    /// 3. West Old Street Alley (西側老街防火巷捷徑 at X = -32)
    /// 4. East Night Market Alley (東側夜市美食後巷 at X = +32) with overhead red lantern canopy
    /// 5. 8 Modular Island Blocks with accurate non-penetrable colliders
    /// 6. Diverse delivery destination spots across all corridors
    /// </summary>
    public class CityGenerator : MonoBehaviour
    {
        [Header("Materials & Prefabs")]
        [SerializeField] private Material asphaltMaterial;
        [SerializeField] private Material yellowLineMaterial;
        [SerializeField] private Material whiteLineMaterial;
        [SerializeField] private Material sidewalkMaterial;
        [SerializeField] private Material redLanternMaterial;
        [SerializeField] private GameObject buildingPrefab;
        [SerializeField] private GameObject foodStallPrefab;
        [SerializeField] private GameObject gutterCoverPrefab;
        [SerializeField] private GameObject destinationBeaconPrefab;

        [Header("Grid Boundaries")]
        public float minX = -42f;
        public float maxX = 42f;
        public float minZ = -175f;
        public float maxZ = 175f;

        [Header("Generated References")]
        public List<Vector3> deliveryPoints = new List<Vector3>();
        public List<Vector3> gutterPositions = new List<Vector3>();

        private readonly float[] intersectionsZ = new float[] { -90f, 0f, 90f };

        private void Awake()
        {
            GenerateStreetNetwork();
            GenerateIslandBuildings();
            GenerateDeliveryPoints();
        }

        public void GenerateStreetNetwork()
        {
            // 1. Main Asphalt Ground (84m wide x 350m long)
            GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "City_Ground_Asphalt";
            ground.transform.position = Vector3.zero;
            ground.transform.localScale = new Vector3(8.4f, 1f, 35.0f);
            if (asphaltMaterial != null) ground.GetComponent<Renderer>().material = asphaltMaterial;

            // 2. Main Avenue Double Yellow Lines & Borders (segmented across intersections)
            float[] blockStartZ = new float[] { -170f, -80f, 10f, 100f };
            float[] blockEndZ = new float[] { -100f, -10f, 80f, 170f };

            for (int i = 0; i < blockStartZ.Length; i++)
            {
                float zCenter = (blockStartZ[i] + blockEndZ[i]) * 0.5f;
                float length = blockEndZ[i] - blockStartZ[i];

                CreateRoadStripe(new Vector3(-0.15f, 0.02f, zCenter), new Vector3(0.12f, 0.01f, length), yellowLineMaterial, "Main_DoubleYellow_L");
                CreateRoadStripe(new Vector3(0.15f, 0.02f, zCenter), new Vector3(0.12f, 0.01f, length), yellowLineMaterial, "Main_DoubleYellow_R");
                CreateRoadStripe(new Vector3(-5.5f, 0.02f, zCenter), new Vector3(0.15f, 0.01f, length), whiteLineMaterial, "Main_WhiteBorder_L");
                CreateRoadStripe(new Vector3(5.5f, 0.02f, zCenter), new Vector3(0.15f, 0.01f, length), whiteLineMaterial, "Main_WhiteBorder_R");

                // Sidewalks
                CreateSidewalk(new Vector3(-8.3f, 0.12f, zCenter), new Vector3(2.8f, 0.25f, length), sidewalkMaterial, "Main_Sidewalk_W");
                CreateSidewalk(new Vector3(8.3f, 0.12f, zCenter), new Vector3(2.8f, 0.25f, length), sidewalkMaterial, "Main_Sidewalk_E");
            }

            // 3. Three Cross Streets (东西向横向大道 at Z = -90, 0, 90)
            foreach (float z in intersectionsZ)
            {
                // West Branch (X: -34 to -6.5)
                CreateRoadStripe(new Vector3(-20.25f, 0.02f, z - 0.15f), new Vector3(27.5f, 0.01f, 0.12f), yellowLineMaterial, $"Cross_DoubleYellow_W_{z}");
                CreateRoadStripe(new Vector3(-20.25f, 0.02f, z + 0.15f), new Vector3(27.5f, 0.01f, 0.12f), yellowLineMaterial, $"Cross_DoubleYellow_W2_{z}");

                // East Branch (X: 6.5 to 34)
                CreateRoadStripe(new Vector3(20.25f, 0.02f, z - 0.15f), new Vector3(27.5f, 0.01f, 0.12f), yellowLineMaterial, $"Cross_DoubleYellow_E_{z}");
                CreateRoadStripe(new Vector3(20.25f, 0.02f, z + 0.15f), new Vector3(27.5f, 0.01f, 0.12f), yellowLineMaterial, $"Cross_DoubleYellow_E2_{z}");

                // Cross Street Sidewalks (North and South of intersection)
                CreateSidewalk(new Vector3(-19.0f, 0.12f, z - 6.5f), new Vector3(16.0f, 0.25f, 2.6f), sidewalkMaterial, $"Cross_SW_WN_{z}");
                CreateSidewalk(new Vector3(-19.0f, 0.12f, z + 6.5f), new Vector3(16.0f, 0.25f, 2.6f), sidewalkMaterial, $"Cross_SW_WS_{z}");
                CreateSidewalk(new Vector3(19.0f, 0.12f, z - 6.5f), new Vector3(16.0f, 0.25f, 2.6f), sidewalkMaterial, $"Cross_SW_EN_{z}");
                CreateSidewalk(new Vector3(19.0f, 0.12f, z + 6.5f), new Vector3(16.0f, 0.25f, 2.6f), sidewalkMaterial, $"Cross_SW_ES_{z}");
            }

            // 4. Parallel Alleys Decor (West Old Street Alley at X = -32, East Night Market at X = +32)
            for (float az = -155f; az <= 155f; az += 18f)
            {
                if (Mathf.Abs(az - (-90f)) < 12f || Mathf.Abs(az - 0f) < 12f || Mathf.Abs(az - 90f) < 12f) continue;
                gutterPositions.Add(new Vector3(-34.8f, 0.01f, az));
                gutterPositions.Add(new Vector3(34.8f, 0.01f, az));
                gutterPositions.Add(new Vector3(-6.1f, 0.01f, az));
                gutterPositions.Add(new Vector3(6.1f, 0.01f, az));
            }
        }

        public void GenerateIslandBuildings()
        {
            // 8 Island Blocks bounding colliders
            var blockRanges = new (float minZ, float maxZ)[]
            {
                (-168f, -98f),
                (-82f, -10f),
                (10f, 82f),
                (98f, 168f)
            };

            foreach (var b in blockRanges)
            {
                float zCenter = (b.minZ + b.maxZ) * 0.5f;
                float zLength = b.maxZ - b.minZ;

                // West Island Block Collider (X: -27.8 to -9.8, width 18m)
                CreateBlockCollider(new Vector3(-18.8f, 5f, zCenter), new Vector3(18f, 10f, zLength), "Block_West_" + zCenter);

                // East Island Block Collider (X: 9.8 to 27.8, width 18m)
                CreateBlockCollider(new Vector3(18.8f, 5f, zCenter), new Vector3(18f, 10f, zLength), "Block_East_" + zCenter);
            }

            // Outer Perimeter Walls (X = -42 to -35.8, X = 35.8 to 42)
            CreateBlockCollider(new Vector3(-48f, 5f, 0f), new Vector3(24f, 10f, 360f), "Outer_Wall_West");
            CreateBlockCollider(new Vector3(48f, 5f, 0f), new Vector3(24f, 10f, 360f), "Outer_Wall_East");
        }

        public void GenerateDeliveryPoints()
        {
            var dropPoints = new Vector3[]
            {
                new Vector3(4.5f, 0f, -50f),   // Main Avenue (Lin Miss)
                new Vector3(-32.0f, 0f, -35f), // West Old Street Alley
                new Vector3(32.0f, 0f, 45f),   // East Night Market Alley
                new Vector3(-4.5f, 0f, 20f),   // Main Avenue (Mr. Chen)
                new Vector3(-32.0f, 0f, 120f), // West Alley Apartments
                new Vector3(4.8f, 0f, 80f),    // Main Avenue Alphard
                new Vector3(-4.2f, 0f, 150f)   // Uncle Ming Scooter Garage
            };

            foreach (var p in dropPoints)
            {
                deliveryPoints.Add(p);
            }
        }

        private void CreateRoadStripe(Vector3 pos, Vector3 size, Material mat, string name)
        {
            GameObject stripe = GameObject.CreatePrimitive(PrimitiveType.Cube);
            stripe.name = name;
            stripe.transform.position = pos;
            stripe.transform.localScale = size;
            if (mat != null) stripe.GetComponent<Renderer>().material = mat;
            Destroy(stripe.GetComponent<Collider>());
        }

        private void CreateSidewalk(Vector3 pos, Vector3 size, Material mat, string name)
        {
            GameObject sw = GameObject.CreatePrimitive(PrimitiveType.Cube);
            sw.name = name;
            sw.transform.position = pos;
            sw.transform.localScale = size;
            if (mat != null) sw.GetComponent<Renderer>().material = mat;
        }

        private void CreateBlockCollider(Vector3 pos, Vector3 size, string name)
        {
            GameObject block = new GameObject(name);
            block.transform.position = pos;
            BoxCollider col = block.AddComponent<BoxCollider>();
            col.size = size;
            block.isStatic = true;
        }
    }
}
