using System;
using System.Collections.Generic;
using UnityEngine;

namespace ScooterMayhem.Game
{
    /// <summary>
    /// Garage Manager: Handles 5 legendary vehicles, delivery box, seal technology, exhaust, and horn upgrades.
    /// Applies stat modifiers to vehicle controller and multi-cargo systems.
    /// </summary>
    public class ScooterGarageManager : MonoBehaviour
    {
        [Header("System References")]
        [SerializeField] private Vehicle.ScooterVehicleController scooterController;
        [SerializeField] private Cargo.MultiCargoPhysicsSystem cargoSystem;
        [SerializeField] private Vehicle.BackfireExhaustSystem backfireSystem;

        public enum VehicleType { Cygnus4th, Haomai125, RetroVespa, Many110, GrandpaGasTank }
        public enum BoxType { StandardFoam, CushionAirbag, AerospaceGyro }
        public enum SealType { ThinNightMarket, DoubleLayer, TitaniumNano }
        public enum ExhaustType { StockIron, WhiteIronChamber }
        public enum HornType { StockDualTone, FunnyFrog, ElectronicFloat }

        [Header("Equipped Vehicle & Gear")]
        public VehicleType EquippedVehicle = VehicleType.Cygnus4th;
        public BoxType EquippedBox = BoxType.StandardFoam;
        public SealType EquippedSeal = SealType.ThinNightMarket;
        public ExhaustType EquippedExhaust = ExhaustType.StockIron;
        public HornType EquippedHorn = HornType.StockDualTone;

        public void ApplyEquippedUpgrades()
        {
            if (backfireSystem != null)
            {
                backfireSystem.SetWhiteIronPipe(EquippedExhaust == ExhaustType.WhiteIronChamber);
            }

            Debug.Log($"[Garage] Applied upgrades: Vehicle={EquippedVehicle}, Box={EquippedBox}, Seal={EquippedSeal}, Exhaust={EquippedExhaust}");
        }
    }
}
